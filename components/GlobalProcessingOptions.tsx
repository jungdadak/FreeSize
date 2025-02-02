'use client';

import * as React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/store/fileStore';
import type { ProcessingOption } from '@/store/fileStore';

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

export default function GlobalProcessingOptions() {
  const { updateAllProcessingOptions } = useFileStore();
  const [globalMethod, setGlobalMethod] = React.useState<
    'upscale' | 'uncrop' | 'square'
  >('upscale');
  const [globalOption, setGlobalOption] = React.useState<string>('');
  const [appliedSetting, setAppliedSetting] = React.useState<string | null>(
    null
  );
  const [isFolded, setIsFolded] = React.useState<boolean>(false);

  // 처리 방법 변경 시 옵션은 빈 값으로 리셋
  const handleMethodChange = (value: string) => {
    const method = value as 'upscale' | 'uncrop' | 'square';
    setGlobalMethod(method);
    setGlobalOption('');
  };

  // 옵션 변경
  const handleOptionChange = (value: string) => {
    setGlobalOption(value);
  };

  // 전체 적용 버튼 클릭 시, 옵션이 선택되어 있지 않으면 동작하지 않음
  const handleApply = () => {
    if (!globalOption) return;
    let option: ProcessingOption;
    if (globalMethod === 'upscale') {
      option = {
        method: 'upscale',
        factor: globalOption as 'x1' | 'x2' | 'x4',
      };
    } else if (globalMethod === 'uncrop') {
      option = {
        method: 'uncrop',
        aspectRatio: globalOption as '1:2' | '2:1',
      };
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
      <div className="rounded-xl p-6 bg-white dark:bg-gray-900">
        {/* 헤더 영역: 제목 및 접기/펼치기 버튼 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">
            일괄 옵션 적용
          </h3>
          <button
            onClick={() => setIsFolded(!isFolded)}
            className="px-2 py-1 text-sm bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          >
            {isFolded ? '펼치기' : '접기'}
          </button>
        </div>

        {/* 상세 옵션 영역 */}
        {!isFolded && (
          <>
            <Tabs
              value={globalMethod}
              onValueChange={handleMethodChange}
              defaultValue="upscale"
              className="w-full mb-4"
            >
              {/* 메서드 선택 버튼 */}
              <div className="flex space-x-2">
                {globalProcessingMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodChange(method.id)}
                    className={`
                      flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${
                        globalMethod === method.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-[#1e1e1e] hover:bg-gray-300 dark:hover:bg-[#2e2e2e] text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {method.label}
                  </button>
                ))}
              </div>

              {/* 세부 옵션 (RadioGroup) */}
              <div className="rounded-lg p-4 bg-gray-50 dark:bg-[#1e1e1e]">
                {globalMethod === 'upscale' && (
                  <RadioGroup
                    value={globalOption}
                    onValueChange={handleOptionChange}
                    className="flex space-x-4"
                  >
                    {optionsMap.upscale.map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={opt}
                          id={`global-upscale-${opt}`}
                          className="border-indigo-600 text-indigo-600"
                        />
                        <label
                          htmlFor={`global-upscale-${opt}`}
                          className="text-sm text-gray-700 dark:text-gray-300"
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
                    className="flex space-x-4"
                  >
                    {optionsMap.uncrop.map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={opt}
                          id={`global-uncrop-${opt}`}
                          className="border-indigo-600 text-indigo-600"
                        />
                        <label
                          htmlFor={`global-uncrop-${opt}`}
                          className="text-sm text-gray-700 dark:text-gray-300"
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
                    className="flex space-x-4"
                  >
                    {optionsMap.square.map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={opt}
                          id={`global-square-${opt}`}
                          className="border-indigo-600 text-indigo-600"
                        />
                        <label
                          htmlFor={`global-square-${opt}`}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          {opt}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </Tabs>

            {/* 적용 버튼 영역 */}
            <div className="flex justify-between items-center">
              {appliedSetting && (
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Now :{' '}
                  <span className="text-yellow-400">{appliedSetting}</span> ✅
                </div>
              )}
              <Button
                onClick={handleApply}
                disabled={!globalOption}
                className={`px-4 py-2 rounded bg-indigo-600 text-white transition-colors duration-200 hover:bg-indigo-800 ${
                  !globalOption ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                전체 적용
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
