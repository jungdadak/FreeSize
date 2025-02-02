'use client';

import * as React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/store/fileStore';
import type { ProcessingOption } from '@/store/fileStore';

// 전역 처리 옵션에서 사용할 처리 방법과 옵션 값 목록
const globalProcessingMethods = [
  { id: 'upscale', label: 'Upscale' },
  { id: 'uncrop', label: 'Uncrop' },
  { id: 'square', label: 'Square' },
] as const;

const optionsMap = {
  upscale: ['x1', 'x2', 'x4'] as const,
  uncrop: ['1:2', '2:1'] as const,
  square: ['1024', '1568', '2048'] as const,
};

// Tabs의 경우, value와 onValueChange가 문자열을 주고받는다고 가정합니다.
// 만약 커스텀 Tabs 컴포넌트의 타입이 다르다면 적절히 수정하세요.

// GlobalProcessingOptions 컴포넌트
export default function GlobalProcessingOptions() {
  const { updateAllProcessingOptions } = useFileStore();
  const [globalMethod, setGlobalMethod] = React.useState<
    'upscale' | 'uncrop' | 'square'
  >('upscale');
  // 옵션은 string 타입으로 선언하여 드롭다운에서 선택한 값을 그대로 저장
  const [globalOption, setGlobalOption] = React.useState<string>(
    optionsMap['upscale'][0]
  );
  // 적용된 옵션을 표시할 상태
  const [appliedSetting, setAppliedSetting] = React.useState<string | null>(
    null
  );

  // 처리 방법 변경 시: 새로운 방법을 선택하면 해당 방법의 첫 번째 옵션으로 초기화
  const handleMethodChange = (value: string) => {
    const method = value as 'upscale' | 'uncrop' | 'square';
    setGlobalMethod(method);
    setGlobalOption(optionsMap[method][0]);
  };

  // 옵션 변경 (RadioGroup의 onValueChange)
  const handleOptionChange = (value: string) => {
    setGlobalOption(value);
  };

  // 전체 적용 버튼 클릭 시 모든 파일에 옵션을 적용하고, 적용된 정보를 저장해 표시
  const handleApply = () => {
    let option: ProcessingOption;
    if (globalMethod === 'upscale') {
      option = {
        method: 'upscale',
        factor: globalOption as 'x1' | 'x2' | 'x4',
      };
    } else if (globalMethod === 'uncrop') {
      option = { method: 'uncrop', aspectRatio: globalOption as '1:2' | '2:1' };
    } else {
      option = {
        method: 'square',
        targetRes: globalOption as '1024' | '1568' | '2048',
      };
    }
    updateAllProcessingOptions(option);
    setAppliedSetting(`${globalMethod.toUpperCase()} ${globalOption}`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl p-6" style={{ backgroundColor: '#141414' }}>
        <h3 className="text-lg font-semibold mb-4 text-white">
          일괄 옵션 적용
        </h3>
        <Tabs
          value={globalMethod}
          onValueChange={handleMethodChange}
          defaultValue="upscale"
          className="w-full"
        >
          <div className="flex space-x-2 mb-4">
            {globalProcessingMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => handleMethodChange(method.id)}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                  ${
                    globalMethod === method.id
                      ? 'bg-indigo-600 text-white'
                      : 'hover:bg-[#2e2e2e] text-gray-300'
                  }
                `}
                style={{
                  backgroundColor:
                    globalMethod === method.id ? undefined : '#1e1e1e',
                }}
              >
                {method.label}
              </button>
            ))}
          </div>

          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: '#1e1e1e' }}
          >
            {globalMethod === 'upscale' && (
              <RadioGroup
                value={globalOption}
                onValueChange={handleOptionChange}
                className="space-y-2"
              >
                {optionsMap.upscale.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={opt}
                      id={`global-upscale-${opt}`}
                      className="border-indigo-600 text-indigo-600"
                    />
                    <label
                      htmlFor={`global-upscale-${opt}`}
                      className="text-sm text-gray-300"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {globalMethod === 'uncrop' && (
              <RadioGroup
                value={globalOption}
                onValueChange={handleOptionChange}
                className="space-y-2"
              >
                {optionsMap.uncrop.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={opt}
                      id={`global-uncrop-${opt}`}
                      className="border-indigo-600 text-indigo-600"
                    />
                    <label
                      htmlFor={`global-uncrop-${opt}`}
                      className="text-sm text-gray-300"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {globalMethod === 'square' && (
              <RadioGroup
                value={globalOption}
                onValueChange={handleOptionChange}
                className="space-y-2"
              >
                {optionsMap.square.map((opt) => (
                  <div key={opt} className="flex items-center space-x-3">
                    <RadioGroupItem
                      value={opt}
                      id={`global-square-${opt}`}
                      className="border-indigo-600 text-indigo-600"
                    />
                    <label
                      htmlFor={`global-square-${opt}`}
                      className="text-sm text-gray-300"
                    >
                      {opt}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        </Tabs>

        <div className="mt-4 flex justify-between">
          {' '}
          {appliedSetting && (
            <div className="mt-4 text-sm text-gray-300">
              Now : <span className="text-yellow-400">{appliedSetting}</span> ✅
            </div>
          )}
          <Button
            onClick={handleApply}
            className="px-4 py-2 hover:bg-indigo-800 bg-indigo-600 text-white rounded"
          >
            전체 적용
          </Button>
        </div>
      </div>
    </div>
  );
}
