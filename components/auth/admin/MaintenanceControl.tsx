// components/auth/admin/MaintenanceControl.tsx
'use client';

import MaintenanceBannerPreview from '@/components/MaintenanceBannerPreview';
import { MaintenanceType } from '@/types/maintenance';
import { useMaintenance } from '@/hooks/useMaintenance';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import useToastStore from '@/store/toastStore';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const maintenanceTypes = [
  { value: 'destructive', label: '긴급 점검', description: '긴급 오류/장애' },
  { value: 'warning', label: '일반 점검', description: '정기 점검/업데이트' },
  { value: 'info', label: '공지', description: '일반 안내사항' },
  { value: 'maintenance', label: '유지보수', description: '시스템 개선작업' },
] as const;

const MaintenanceControl = () => {
  const { banner, isLoading, isError, error, updateBanner, isUpdating } =
    useMaintenance();
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState<{
    isActive: boolean;
    message: string;
    type: MaintenanceType;
  }>({
    isActive: false,
    message: '',
    type: 'warning',
  });
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    if (banner) {
      setFormData({
        isActive: banner.isActive,
        message: banner.message,
        type: banner.type,
      });
    }
  }, [banner]);

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-10">
          <div className="flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류 발생</AlertTitle>
        <AlertDescription>{error?.message}</AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async () => {
    if (formData.isActive && !formData.message.trim()) {
      showToast('메시지를 입력해주세요.', 'error');
      return;
    }

    try {
      await updateBanner(formData);
      showToast(
        formData.isActive
          ? '서비스 점검 모드가 활성화되었습니다.'
          : '서비스 점검 모드가 비활성화되었습니다.',
        formData.isActive ? 'warning' : 'success'
      );
    } catch {
      showToast('설정 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          서비스 점검 모드
        </CardTitle>
        <CardDescription>
          활성화 시 모든 사용자에게 서비스 점검 배너가 표시됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">점검 모드</Label>
            <div className="text-sm text-muted-foreground">
              {formData.isActive ? '활성화됨' : '비활성화됨'}
            </div>
          </div>
          <Switch
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
            disabled={isUpdating}
            aria-label="점검 모드 토글"
          />
        </div>

        <div className="space-y-2">
          <Label>점검 유형</Label>
          <div className="grid grid-cols-2 gap-4">
            {maintenanceTypes.map((type) => (
              <label key={type.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="maintenanceType"
                  value={type.value}
                  checked={formData.type === type.value}
                  onChange={() =>
                    setFormData((prev) => ({ ...prev, type: type.value }))
                  }
                  disabled={isUpdating}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <div>
                  <span className="font-semibold">{type.label}</span>
                  <span className="text-xs text-muted-foreground block">
                    {type.description}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">
            메시지
            {formData.isActive && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id="message"
            placeholder="서비스 점검 중입니다. 잠시만 기다려 주시기 바랍니다."
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            className="h-32 resize-none"
            disabled={isUpdating}
          />
        </div>

        {previewMode && formData.message && (
          <div className="space-y-2">
            <Label className="text-sm">미리보기:</Label>
            <MaintenanceBannerPreview
              isActive={formData.isActive}
              message={formData.message}
              type={formData.type}
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setPreviewMode(!previewMode)}
            variant="outline"
            disabled={isUpdating}
          >
            {previewMode ? '미리보기 숨기기' : '미리보기'}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="default"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리중...
              </>
            ) : (
              '적용'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceControl;
