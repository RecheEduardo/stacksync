// Lint de vocabulário (FF-06, FD-04, IV-12): sem superlativo, urgência, exclamação ou condicional vago.
// "Índice de Ajuste" sempre por extenso: a sigla nunca representa o índice.

export function lintVocabulario(texto: string, proibidos: { termo: string; motivo: string }[]): string[] {
  const problemas: string[] = [];
  const baixo = texto.toLocaleLowerCase('pt-BR');
  for (const { termo, motivo } of proibidos) {
    if (termo === '!') {
      if (texto.includes('!')) problemas.push(`contém "!" (${motivo})`);
      continue;
    }
    const re = new RegExp(`(^|[^\\p{L}])${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u');
    if (re.test(baixo)) problemas.push(`contém "${termo}" (${motivo})`);
  }
  if (/\bIA\b\s+(de|do)\s+[0-9]/.test(texto) || /Índice de Ajuste \(IA\)/.test(texto))
    problemas.push('usa "IA" como sigla do índice (DV-11)');
  return problemas;
}
