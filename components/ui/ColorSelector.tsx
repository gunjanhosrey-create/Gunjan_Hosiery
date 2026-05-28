import React from 'react';
import { Input } from '@/components/ui/input';
// Button not needed — color selector uses input and buttons in-place
import { X } from 'lucide-react';
import colorMap from '@/lib/colorMap';
import { useDebounce } from '@/hooks/use-debounce';

type ColorItem = { name: string; hex: string };

interface Props {
  value: ColorItem[];
  onChange: (v: ColorItem[]) => void;
}

const normalizeKey = (s: string) => s.replace(/\s+|[-/\\.]/g, '').toLowerCase();

const prettyName = (key: string) => {
  if (!key) return '';
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/(^|\s)\w/g, (m) => m.toUpperCase());
};

export function ColorSelector({ value, onChange }: Props) {
  const [input, setInput] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const debounced = useDebounce(input, 180);
  const [highlight, setHighlight] = React.useState(0);

  const allColors = React.useMemo(() => {
    return Object.keys(colorMap).map((k) => ({ key: k, name: prettyName(k), hex: colorMap[k] }));
  }, []);

  const suggestions = React.useMemo(() => {
    const q = (debounced || '').trim().toLowerCase();
    if (!q) return allColors.slice(0, 12);
    const byName = allColors.filter(c => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q) || c.key.includes(q));
    return byName.slice(0, 20);
  }, [debounced, allColors]);

  React.useEffect(() => {
    setHighlight(0);
  }, [suggestions]);

  const handleSelect = (name: string, hex: string) => {
    const exists = value.some((c) => normalizeKey(c.name) === normalizeKey(name) || c.hex.toLowerCase() === hex.toLowerCase());
    if (exists) return;
    onChange([...value, { name, hex }]);
    setInput('');
    setOpen(false);
  };

  const handleRemove = (idx: number) => {
    const next = [...value]; next.splice(idx, 1); onChange(next);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight((h) => Math.min(h + 1, suggestions.length - 1)); setOpen(true); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && suggestions[highlight]) {
        handleSelect(suggestions[highlight].name, suggestions[highlight].hex);
      }
    } else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((c, idx) => (
            <span key={`${c.name}-${idx}`} className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
              <span className="max-w-[8rem] truncate">{c.name}</span>
              <button type="button" onClick={() => handleRemove(idx)} className="opacity-70 hover:opacity-100">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="relative">
          <Input
            placeholder="Type color name or hex (e.g. red, navy, #ff0000)"
            value={input}
            onChange={(e) => { setInput(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
          />

          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-lg bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800 max-h-64 overflow-auto">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between">
                  <span>Suggestions</span>
                  <span className="text-xxs">{suggestions.length} matches</span>
                </div>
                {suggestions.map((s, i) => (
                  <button
                    type="button"
                    key={s.key}
                    onClick={() => handleSelect(s.name, s.hex)}
                    onMouseEnter={() => setHighlight(i)}
                    className={`w-full text-left flex items-center gap-3 px-2 py-2 rounded transition ${i === highlight ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                  >
                    <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: s.hex }} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.hex.toUpperCase()}</div>
                    </div>
                  </button>
                ))}

                {/* custom creation disabled: only allow selecting from colorMap */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ColorSelector;
