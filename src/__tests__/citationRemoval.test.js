import { removeCitations } from '../components/CardEditor';

describe('Citation Removal', () => {
  test('removes single citations', () => {
    const text = 'Текст с цитатой[1]';
    const result = removeCitations(text);
    expect(result).toBe('Текст с цитатой');
  });

  test('removes multiple citations', () => {
    const text = 'Несколько[1][2][3] подряд';
    const result = removeCitations(text);
    expect(result).toBe('Несколько подряд');
  });

  test('leaves text without citations unchanged', () => {
    const text = 'Обычный текст';
    const result = removeCitations(text);
    expect(result).toBe('Обычный текст');
  });

  test('removes citations with multiple digits', () => {
    const text = 'Текст[123] с длинной цитатой';
    const result = removeCitations(text);
    expect(result).toBe('Текст с длинной цитатой');
  });

  test('handles text with no citations', () => {
    const text = 'Text without any citations at all';
    const result = removeCitations(text);
    expect(result).toBe('Text without any citations at all');
  });

  test('removes citations at the beginning and end', () => {
    const text = '[1]Text at the beginning and end[5]';
    const result = removeCitations(text);
    expect(result).toBe('Text at the beginning and end');
  });
});