import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/axios';
import { getLocalizedValue } from '@/lib/i18n/multiLang';

export interface CodeOption {
  value: string;
  label: string;
  labelEn: string;
  labelKo: string;
  labelZh?: string;
  labelVi?: string;
  attributes?: Record<string, any>;
}

interface Code {
  id: string;
  codeType: string;
  code: string;
  name: {
    en: string;
    ko: string;
    zh?: string;
    vi?: string;
  };
  description: {
    en: string;
    ko: string;
    zh?: string;
    vi?: string;
  };
  order: number;
  status: string;
  attributes?: Record<string, any>;
}

/**
 * Hook to fetch and manage code options from the code management system
 * @param codeType - The code type to fetch (e.g., 'COMMON_STATUS', 'DEPARTMENT', 'MESSAGE_TYPE')
 * @param locale - Current locale for localized labels (defaults to 'en')
 * @param autoFetch - Whether to automatically fetch on mount (defaults to true)
 * @returns Object containing codes, loading state, error, and refetch function
 */
export function useCodeOptions(codeType: string, locale: string = 'en', autoFetch: boolean = true) {
  const [codes, setCodes] = useState<CodeOption[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    if (!codeType) {
      setError('Code type is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/code/type/${codeType}`);
      const fetchedCodes: Code[] = response.codes || [];

      // Transform codes to options format
      const options: CodeOption[] = fetchedCodes
        .filter((code: Code) => code.status === 'active')
        .sort((a: Code, b: Code) => a.order - b.order)
        .map((code: Code) => ({
          value: code.code.toLowerCase(),
          label: getLocalizedValue(code.name, locale),
          labelEn: code.name.en,
          labelKo: code.name.ko,
          labelZh: code.name.zh,
          labelVi: code.name.vi,
          attributes: code.attributes
        }));

      setCodes(options);
    } catch (err: any) {
      console.error(`Failed to fetch codes for type ${codeType}:`, err);
      setError(err.response?.data?.error || 'Failed to fetch codes');
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [codeType, locale]);

  useEffect(() => {
    if (autoFetch && codeType) {
      void fetchCodes();
    }
  }, [autoFetch, codeType, fetchCodes]);

  return {
    codes,
    loading,
    error,
    refetch: fetchCodes
  };
}

/**
 * Hook to get a single code option by its value
 * @param codeType - The code type
 * @param codeValue - The code value to find
 * @param locale - Current locale
 * @returns Single code option or null
 */
export function useCodeOption(codeType: string, codeValue: string | null | undefined, locale: string = 'en') {
  const { codes, loading, error } = useCodeOptions(codeType, locale);

  const codeOption = codes.find(c => c.value === codeValue?.toLowerCase()) || null;

  return {
    code: codeOption,
    loading,
    error
  };
}

/**
 * Hook to fetch multiple code types at once
 * @param codeTypes - Array of code types to fetch
 * @param locale - Current locale
 * @returns Map of code type to code options
 */
export function useMultipleCodeOptions(codeTypes: string[], locale: string = 'en') {
  const [codesMap, setCodesMap] = useState<Record<string, CodeOption[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllCodes = useCallback(async () => {
    if (!codeTypes || codeTypes.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const promises = codeTypes.map(async (codeType) => {
        try {
          const response = await api.get(`/code/type/${codeType}`);
          const fetchedCodes: Code[] = response.codes || [];

          const options: CodeOption[] = fetchedCodes
            .filter((code: Code) => code.status === 'active')
            .sort((a: Code, b: Code) => a.order - b.order)
            .map((code: Code) => ({
              value: code.code.toLowerCase(),
              label: getLocalizedValue(code.name, locale),
              labelEn: code.name.en,
              labelKo: code.name.ko,
              labelZh: code.name.zh,
              labelVi: code.name.vi,
              attributes: code.attributes
            }));

          return { codeType, options };
        } catch (err) {
          console.error(`Failed to fetch codes for type ${codeType}:`, err);
          return { codeType, options: [] };
        }
      });

      const results = await Promise.all(promises);

      const newCodesMap: Record<string, CodeOption[]> = {};
      results.forEach(({ codeType, options }) => {
        newCodesMap[codeType] = options;
      });

      setCodesMap(newCodesMap);
    } catch (err: any) {
      console.error('Failed to fetch multiple codes:', err);
      setError(err.response?.data?.error || 'Failed to fetch codes');
    } finally {
      setLoading(false);
    }
  }, [codeTypes, locale]);

  useEffect(() => {
    void fetchAllCodes();
  }, [fetchAllCodes]);

  return {
    codesMap,
    loading,
    error,
    refetch: fetchAllCodes
  };
}
