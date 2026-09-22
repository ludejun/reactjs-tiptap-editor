import { Check, Palette } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';

import { Button, Input, Popover, PopoverContent, PopoverTrigger } from '@/components';
import { NoFill } from '@/components/icons/NoFill';
import { COLORS_LIST as DEFAULT_COLORS_LIST } from '@/constants';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';

export interface ColorPickerProps {
  disabled?: boolean;
  colors?: string[];
  children: React.ReactNode;
  onChange?: (color: string | undefined) => void;
  value?: string;
  highlight?: boolean;
}

/** One row of the picker: icon slot, label, same inset as everything else. */
const MenuRow = ({
  children,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick: () => void;
}) => (
  <button
    className='richtext-flex richtext-w-full richtext-items-center richtext-gap-2 richtext-rounded-sm !richtext-border-none !richtext-bg-transparent richtext-px-1.5 richtext-py-1.5 richtext-text-left richtext-text-sm richtext-text-foreground !richtext-outline-none richtext-transition-colors hover:!richtext-bg-accent'
    onClick={onClick}
    type='button'
  >
    <span className='richtext-flex richtext-size-4 richtext-shrink-0 richtext-items-center richtext-justify-center'>
      {icon}
    </span>

    {children}
  </button>
);

const Swatch = ({
  color,
  onSelect,
  selected,
}: {
  color: string;
  onSelect: () => void;
  selected: boolean;
}) => (
  <button
    aria-label={color}
    onClick={onSelect}
    title={color}
    type='button'
    className={cn(
      'richtext-relative richtext-flex richtext-size-[18px] richtext-items-center richtext-justify-center richtext-rounded-[4px] !richtext-border !richtext-border-solid !richtext-border-black/10 richtext-p-0 richtext-transition-transform hover:richtext-scale-110',
      selected && 'richtext-ring-2 richtext-ring-foreground richtext-ring-offset-1'
    )}
    style={{ backgroundColor: color }}
  >
    {selected ? (
      <Check
        className='richtext-size-3 richtext-drop-shadow-[0_0_1px_rgba(0,0,0,0.6)]'
        color='#fff'
        strokeWidth={3}
      />
    ) : null}
  </button>
);

function ColorPicker(props: ColorPickerProps) {
  const { t } = useLocale();

  const { disabled = false, value, onChange, colors = DEFAULT_COLORS_LIST, highlight } = props;
  const [open, setOpen] = useState(false);

  const chunkedColors = useMemo(() => {
    const chunked: string[][] = [];

    for (let i = 0; i < colors.length; i += 10) {
      chunked.push(colors.slice(i, i + 10));
    }

    return chunked;
  }, [colors]);

  const [recentColorsStore, setRecentColorsStore] = useLocalStorage<string[]>(
    highlight ? 'richtext-recent-highlight' : 'richtext-recent-colors',
    []
  );

  const setRecentColor = (color: string) => {
    const newRecentColors = [...recentColorsStore];
    const index = newRecentColors.indexOf(color);

    if (index !== -1) {
      newRecentColors.splice(index, 1);
    }

    newRecentColors.unshift(color);

    if (newRecentColors.length > 10) {
      newRecentColors.pop();
    }

    setRecentColorsStore(newRecentColors);
  };

  function setColor(color: string | undefined) {
    if (color === undefined) {
      onChange?.(color);
      setOpen(false);
      return;
    }

    if (/^#([\da-f]{3}){1,2}$/i.test(color)) {
      onChange?.(color);
      setRecentColor(color);
      setOpen(false);
    }
  }

  return (
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild className='!richtext-p-0' disabled={disabled}>
        {props?.children}
      </PopoverTrigger>

      <PopoverContent
        align='start'
        className='!richtext-w-auto !richtext-p-1.5'
        hideWhenDetached
        side='bottom'
      >
        <div className='richtext-flex richtext-flex-col richtext-gap-1.5'>
          <MenuRow icon={<NoFill />} onClick={() => setColor(undefined)}>
            {t(highlight ? 'editor.nofill' : 'editor.default')}
          </MenuRow>

          {/* The grid is inset by the same 6px as the rows above and below. */}
          <div className='richtext-flex richtext-flex-col richtext-gap-1 richtext-px-1.5'>
            {chunkedColors.map((row, index) => (
              <div className='richtext-flex richtext-gap-1' key={`color-row-${index}`}>
                {row.map((color) => (
                  <Swatch
                    color={color}
                    key={color}
                    onSelect={() => setColor(color)}
                    selected={color === value}
                  />
                ))}
              </div>
            ))}
          </div>

          {recentColorsStore.length ? (
            <div className='richtext-flex richtext-flex-col richtext-gap-1 richtext-px-1.5'>
              <span className='richtext-text-xs richtext-text-muted-foreground'>
                {t('editor.recent')}
              </span>

              <div className='richtext-flex richtext-flex-wrap richtext-gap-1'>
                {recentColorsStore.map((color, index) => (
                  <Swatch
                    color={color}
                    key={`recent-${index}`}
                    onSelect={() => setColor(color)}
                    selected={color === value}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <AddMoreColor setColor={setColor} />
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface AddMoreColorProps {
  setColor: (color: string) => void;
}

function AddMoreColor({ setColor }: AddMoreColorProps) {
  const { t } = useLocale();
  const [openColorMore, setOpenColorMore] = useState(false);
  const [colorSelected, setColorSelected] = useState('#000000');

  const onValueChange = useCallback((value: string) => {
    setColorSelected(value);
  }, []);

  return (
    <Popover onOpenChange={setOpenColorMore} open={openColorMore}>
      <PopoverTrigger asChild>
        <button
          className='richtext-flex richtext-w-full richtext-items-center richtext-gap-2 richtext-rounded-sm !richtext-border-none !richtext-bg-transparent richtext-px-1.5 richtext-py-1.5 richtext-text-left richtext-text-sm richtext-text-foreground !richtext-outline-none richtext-transition-colors hover:!richtext-bg-accent'
          type='button'
        >
          <span className='richtext-flex richtext-size-4 richtext-shrink-0 richtext-items-center richtext-justify-center'>
            <Palette size={15} />
          </span>

          {t('editor.color.more')}
        </button>
      </PopoverTrigger>

      <PopoverContent className='!richtext-w-auto !richtext-p-2'>
        <div className='richtext-flex richtext-flex-col richtext-gap-2'>
          <HexColorPicker color={colorSelected} onChange={onValueChange} />

          <div className='richtext-flex richtext-items-center richtext-gap-2'>
            <span
              className='richtext-size-8 richtext-shrink-0 richtext-rounded-md !richtext-border !richtext-border-solid !richtext-border-border'
              style={{ backgroundColor: colorSelected }}
            />

            <Input
              className='richtext-h-8 richtext-flex-1'
              type='text'
              value={colorSelected}
              onChange={(event) => {
                const next = event.currentTarget.value;

                onValueChange(next.startsWith('#') ? next : `#${next}`);
              }}
            />
          </div>

          <Button
            className='richtext-h-8 richtext-w-full'
            size='sm'
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              setColor(colorSelected);
              setOpenColorMore(false);
            }}
          >
            {t('editor.image.dialog.button.apply')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { ColorPicker };
