// 翻译API服务
// 使用免费的MyMemory翻译API

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationError {
  message: string;
  code?: string;
}

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// 语言代码映射
const languageMap: Record<string, string> = {
  'zh-CN': 'zh-CN',
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
};

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult> {
  if (!text.trim()) {
    throw new Error('翻译内容不能为空');
  }

  if (sourceLang === targetLang) {
    return {
      translatedText: text,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    };
  }

  const source = languageMap[sourceLang] || sourceLang;
  const target = languageMap[targetLang] || targetLang;

  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `${source}|${target}`,
    });

    const response = await fetch(`${MYMEMORY_API}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`翻译请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus !== 200 && data.responseStatus !== '200') {
      throw new Error(data.responseDetails || '翻译失败');
    }

    return {
      translatedText: data.responseData.translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('翻译服务暂时不可用，请稍后重试');
  }
}

// 批量翻译
export async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string
): Promise<TranslationResult[]> {
  const promises = texts.map(text => translateText(text, sourceLang, targetLang));
  return Promise.all(promises);
}

// 检测语言（简单实现）
export function detectLanguage(text: string): string {
  // 简单的语言检测逻辑
  const chineseRegex = /[一-鿿]/;
  const japaneseRegex = /[぀-ゟ゠-ヿ]/;
  const koreanRegex = /[가-힯ᄀ-ᇿ]/;

  if (chineseRegex.test(text)) return 'zh-CN';
  if (japaneseRegex.test(text)) return 'ja';
  if (koreanRegex.test(text)) return 'ko';
  return 'en';
}
