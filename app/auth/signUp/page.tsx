'use client';
import { useState, useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from '@/lib/axios';
import useToastStore from '@/store/toastStore';
interface ValidationErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  name?: string;
}

const SignupPage = () => {
  const showToast = useToastStore((state) => state.showToast);

  const { signup, error: signupError, loading } = useAuthStore();
  const router = useRouter();
  const [isFormValid, setIsFormValid] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
  });

  // 유효성 검사 상태
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckMessage, setEmailCheckMessage] = useState('');
  const [emailCheckStatus, setEmailCheckStatus] = useState<
    'none' | 'success' | 'error'
  >('none');

  // 비밀번호 유효성 검사 규칙
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    return {
      isValid:
        password.length >= minLength &&
        hasSpecialChar &&
        hasNumber &&
        hasLetter,
      message:
        password.length >= minLength && hasSpecialChar && hasNumber && hasLetter
          ? ''
          : '비밀번호는 8자 이상이며, 특수문자, 숫자, 영문자를 포함해야 합니다.',
    };
  };

  // 이메일 형식 검사
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 입력값 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 비밀번호 확인 실시간 검증
    if (name === 'password' || name === 'passwordConfirm') {
      if (name === 'password') {
        const { message } = validatePassword(value);
        setValidationErrors((prev) => ({
          ...prev,
          password: message,
          passwordConfirm:
            formData.passwordConfirm && value !== formData.passwordConfirm
              ? '비밀번호가 일치하지 않습니다.'
              : '',
        }));
      } else {
        setValidationErrors((prev) => ({
          ...prev,
          passwordConfirm:
            value && value !== formData.password
              ? '비밀번호가 일치하지 않습니다.'
              : '',
        }));
      }
    }
  };

  // 이메일 blur 핸들러
  const handleEmailBlur = () => {
    if (!formData.email) return;

    if (!validateEmail(formData.email)) {
      setValidationErrors((prev) => ({
        ...prev,
        email: '올바른 이메일 형식이 아닙니다.',
      }));
      return;
    }

    setValidationErrors((prev) => ({
      ...prev,
      email: '',
    }));
  };

  // 이메일 중복 확인
  const checkEmail = async () => {
    if (!formData.email || validationErrors.email) return;

    setIsCheckingEmail(true);
    try {
      const response = await axios.post('/api/auth/check-email', {
        email: formData.email,
      });
      const { available, message } = response.data;

      setEmailCheckMessage(message);
      setEmailCheckStatus(available ? 'success' : 'error');

      // 여기에 추가
      if (available) {
        setValidationErrors((prev) => ({ ...prev, email: '' }));
      }

      setIsEmailChecked(available);
    } catch {
      setEmailCheckMessage('이메일 확인 중 오류가 발생했습니다.');
      setEmailCheckStatus('error');
      setIsEmailChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };
  useEffect(() => {
    const allFieldsFilled =
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.passwordConfirm.trim() !== '' &&
      formData.name.trim() !== '';

    const passwordCheck = validatePassword(formData.password);
    const passwordsMatch = formData.password === formData.passwordConfirm;
    const emailIsValid = validateEmail(formData.email) && isEmailChecked;

    // 실제 에러가 있는지 확인
    const hasErrors = Object.values(validationErrors).some(
      (error) => error !== ''
    );

    const isValid =
      allFieldsFilled &&
      passwordCheck.isValid &&
      passwordsMatch &&
      emailIsValid &&
      !hasErrors;

    console.log('Form validation check:', {
      allFieldsFilled,
      passwordValid: passwordCheck.isValid,
      passwordsMatch,
      emailIsValid,
      hasErrors,
      finalIsValid: isValid,
    });

    setIsFormValid(isValid);
  }, [formData, isEmailChecked, validationErrors]);
  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEmailChecked) {
      setValidationErrors((prev) => ({
        ...prev,
        email: '이메일 중복 확인이 필요합니다.',
      }));
      return;
    }

    const { isValid } = validatePassword(formData.password);
    if (!isValid) return;

    if (formData.password !== formData.passwordConfirm) {
      setValidationErrors((prev) => ({
        ...prev,
        passwordConfirm: '비밀번호가 일치하지 않습니다.',
      }));
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.name);
      showToast('회원가입이 완료되었습니다!');
      // 토스트가 보여진 후 페이지 이동
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  // 비밀번호 요구사항 컴포넌트
  const PasswordRequirements = ({ password }: { password: string }) => {
    const requirements = [
      { met: password.length >= 8, text: '8자 이상' },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: '특수문자 포함' },
      { met: /\d/.test(password), text: '숫자 포함' },
      { met: /[a-zA-Z]/.test(password), text: '영문자 포함' },
    ];

    return (
      <div className="mt-2 space-y-1">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={`text-xs flex items-center space-x-1 ${
              req.met
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span>{req.met ? '✓' : '○'}</span>
            <span>{req.text}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-[#1e1e1e] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-[#1a1a1a] p-8 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
            회원가입
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            계정을 만들어 서비스를 이용해보세요
          </p>
        </div>

        {signupError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-4 rounded-md text-sm">
            {signupError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* 이메일 필드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  required
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors
                    ${
                      emailCheckStatus === 'error' || validationErrors.email
                        ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                        : emailCheckStatus === 'success'
                        ? 'border-green-300 focus:ring-green-500 dark:border-green-700'
                        : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'
                    }
                    dark:bg-[#141414] dark:text-gray-100`}
                  placeholder="your@email.com"
                />
                <button
                  type="button"
                  onClick={checkEmail}
                  disabled={
                    isCheckingEmail ||
                    !formData.email ||
                    !!validationErrors.email
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed transition-colors"
                >
                  {isCheckingEmail ? '확인중...' : '중복확인'}
                </button>
              </div>
              {emailCheckMessage && (
                <p
                  className={`mt-1 text-xs ${
                    emailCheckStatus === 'success'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {emailCheckMessage}
                </p>
              )}
              {validationErrors.email && !emailCheckMessage && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* 비밀번호 필드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors
                  ${
                    validationErrors.password
                      ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                      : 'border-gray-300 focus:ring-green-500 dark:border-gray-600'
                  }
                  dark:bg-[#141414] dark:text-gray-100`}
                placeholder="********"
              />
              <PasswordRequirements password={formData.password} />
            </div>

            {/* 비밀번호 확인 필드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors
                  ${
                    validationErrors.passwordConfirm
                      ? 'border-red-300 focus:ring-red-500 dark:border-red-700'
                      : 'border-gray-300 focus:ring-green-500 dark:border-gray-600'
                  }
                  dark:bg-[#141414] dark:text-gray-100`}
                placeholder="********"
              />
              {validationErrors.passwordConfirm && (
                <p className="mt-1 text-xs text-red-500">
                  {validationErrors.passwordConfirm}
                </p>
              )}
            </div>

            {/* 이름 필드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-[#141414] dark:text-gray-100 transition-colors"
                placeholder="홍길동"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '처리중...' : '가입하기'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            이미 계정이 있으신가요?{' '}
            <Link
              href="/auth/login"
              className="text-green-600 dark:text-green-400 hover:text-green-500 font-medium"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
