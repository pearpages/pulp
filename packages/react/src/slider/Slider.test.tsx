import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Slider } from './Slider';

describe('Slider', () => {
  it('is a labelled slider with an output showing the formatted value', () => {
    render(<Slider label="Volume" defaultValue={0.4} formatOptions={{ style: 'percent' }} step={0.01} max={1} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveValue('0.4');
    expect(slider).toHaveAttribute('aria-valuetext', '40%');
    expect(screen.getByRole('status')).toHaveTextContent('40%');
  });

  it('keyboard: arrows step, Home and End jump, onChange and onChangeEnd fire', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(<Slider label="Volume" defaultValue={50} step={5} onChange={onChange} onChangeEnd={onChangeEnd} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    await user.tab();
    expect(slider).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith(55);
    expect(onChangeEnd).toHaveBeenLastCalledWith(55);
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith(100);
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('range: two named thumbs, values as a pair, the minimum cannot pass the maximum', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider label="Price" defaultValue={[20, 80]} onChange={onChange} thumbLabels={['Lowest', 'Highest']} />);
    const low = screen.getByRole('slider', { name: /Lowest/ });
    const high = screen.getByRole('slider', { name: /Highest/ });
    expect(low).toHaveAttribute('max', '80');
    expect(high).toHaveAttribute('min', '20');
    expect(screen.getByRole('status')).toHaveTextContent('20–80');
    low.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith([21, 80]);
    expect(screen.getByRole('group', { name: 'Price' })).toHaveAttribute('data-range');
  });

  it('is controlled by `value`, disabled reaches the input, the label can be visually hidden', () => {
    const { rerender } = render(<Slider label="Volume" value={30} hideLabel />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toHaveValue('30');
    expect(screen.getByText('Volume').className).toMatch(/hidden/);
    rerender(<Slider label="Volume" value={30} disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('has no accessibility violations, single and range', async () => {
    const { container } = render(
      <>
        <Slider label="Volume" defaultValue={40} description="Applies to every speaker" />
        <Slider label="Price" defaultValue={[20, 80]} />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
