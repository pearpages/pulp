import type { ReactNode, Ref } from 'react';
import {
  Label as AriaLabel,
  Slider as AriaSlider,
  SliderFill as AriaSliderFill,
  SliderOutput as AriaSliderOutput,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
  Text as AriaText,
} from 'react-aria-components';
import { classes } from '../internal/classes';
import fieldStyles from '../internal/AriaField.module.css';
import styles from './Slider.module.css';

export type SliderValue = number | [number, number];
export type SliderOrientation = 'horizontal' | 'vertical';

export interface SliderProps<T extends SliderValue = number> {
  /** Visible label. Always rendered; `hideLabel` keeps it for assistive technology only. */
  label: ReactNode;
  /** @default false */
  hideLabel?: boolean;
  description?: ReactNode;
  /** One number, or a `[start, end]` pair for a range with two thumbs. */
  value?: T;
  defaultValue?: T;
  /** Called on every change while dragging or pressing arrows. */
  onChange?: (value: T) => void;
  /** Called once when the drag ends or the key is released. */
  onChangeEnd?: (value: T) => void;
  /** @default 0 */
  min?: number;
  /** @default 100 */
  max?: number;
  /** @default 1 */
  step?: number;
  /** How the value reads in the output and to assistive technology, for instance `{ style: 'percent' }` or `{ style: 'currency', currency: 'EUR' }`. */
  formatOptions?: Intl.NumberFormatOptions;
  /** Names for the two thumbs of a range. @default ['Minimum', 'Maximum'] */
  thumbLabels?: readonly [string, string];
  /** Show the formatted value next to the label. @default true */
  showOutput?: boolean;
  /** @default 'horizontal' */
  orientation?: SliderOrientation;
  /** @default false */
  disabled?: boolean;
  /** Submitted with a form; a range submits two inputs with this name. */
  name?: string;
  className?: string;
  /** The group element. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Picks a number, or a range, on a track: React Aria's slider (decision
 * record 001) provides the hidden range inputs, arrow, Page Up/Down, Home and
 * End keys, drag with a thumb that stays under the pointer, and
 * `aria-valuetext` in the formatted form. The output element shows the
 * same text, so what a screen reader hears is what sighted users see.
 */
export function Slider<T extends SliderValue = number>({
  label,
  hideLabel = false,
  description,
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  min = 0,
  max = 100,
  step = 1,
  formatOptions,
  thumbLabels = ['Minimum', 'Maximum'],
  showOutput = true,
  orientation = 'horizontal',
  disabled = false,
  name,
  className,
  ref,
}: SliderProps<T>) {
  const range = Array.isArray(value ?? defaultValue);
  return (
    <AriaSlider
      ref={ref}
      className={classes(styles.root, className)}
      data-range={range ? '' : undefined}
      value={value as number | number[] | undefined}
      defaultValue={(defaultValue ?? (range ? [min, max] : min)) as number | number[]}
      onChange={onChange as ((value: number | number[]) => void) | undefined}
      onChangeEnd={onChangeEnd as ((value: number | number[]) => void) | undefined}
      minValue={min}
      maxValue={max}
      step={step}
      formatOptions={formatOptions}
      orientation={orientation}
      isDisabled={disabled}
    >
      <div className={styles.header}>
        <AriaLabel className={classes(fieldStyles.label, hideLabel && styles.hidden)}>{label}</AriaLabel>
        {showOutput && <AriaSliderOutput className={styles.output} />}
      </div>
      <AriaSliderTrack className={styles.track}>
        <span className={styles.rail} aria-hidden="true">
          <AriaSliderFill className={styles.fill} />
        </span>
        <AriaSliderThumb index={0} className={styles.thumb} aria-label={range ? thumbLabels[0] : undefined} name={name} />
        {range && <AriaSliderThumb index={1} className={styles.thumb} aria-label={thumbLabels[1]} name={name} />}
      </AriaSliderTrack>
      {description && (
        <AriaText slot="description" className={fieldStyles.description}>
          {description}
        </AriaText>
      )}
    </AriaSlider>
  );
}

Slider.displayName = 'Slider';
