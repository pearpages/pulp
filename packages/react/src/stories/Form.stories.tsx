import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { FormEvent } from 'react';
import { Button } from '../button';
import { Card } from '../card';
import { Checkbox } from '../checkbox';
import { Heading } from '../heading';
import { Inline } from '../inline';
import { Radio, RadioGroup } from '../radio';
import { Select } from '../select';
import { Stack } from '../stack';
import { Switch } from '../switch';
import { Text } from '../text';
import { TextField } from '../text-field';
import { Textarea } from '../textarea';

interface FormProps {
  onSubmit: (values: Record<string, FormDataEntryValue>) => void;
}

/** Every form control in one form: the integration test for Field. */
function SignupForm({ onSubmit }: FormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(Object.fromEntries(new FormData(event.currentTarget)));
  };
  return (
    <Card variant="outlined" padding="lg">
      <form onSubmit={handleSubmit} noValidate>
        <Card.Header>
          <Heading level={2} size="lg">
            Create your workspace
          </Heading>
          <Text tone="muted">Everything here is a pulp form control on top of Field.</Text>
        </Card.Header>
        <Card.Body>
          <Stack gap={5}>
            <TextField name="name" label="Workspace name" required placeholder="Acme" />
            <TextField name="email" label="Email" type="email" description="Where we send the invoices." />
            <Select name="brand" label="Brand" placeholder="Choose a brand" required>
              <option value="pulp">pulp</option>
              <option value="bitepals">bitepals</option>
            </Select>
            <RadioGroup name="plan" label="Plan" defaultValue="free" orientation="horizontal">
              <Radio value="free" label="Free" />
              <Radio value="team" label="Team" />
            </RadioGroup>
            <Textarea name="about" label="About" rows={2} autoGrow placeholder="Optional" />
            <Checkbox name="terms" value="yes" label="I accept the terms" required />
            <Switch name="updates" value="yes" label="Product updates" defaultChecked />
          </Stack>
        </Card.Body>
        <Card.Footer>
          <Inline gap={2} justify="end">
            <Button type="reset" variant="ghost">
              Reset
            </Button>
            <Button type="submit">Create workspace</Button>
          </Inline>
        </Card.Footer>
      </form>
    </Card>
  );
}

const meta = {
  title: 'Patterns/Form',
  component: SignupForm,
  args: { onSubmit: fn() },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof SignupForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Workspace name/), 'Acme');
    await userEvent.type(canvas.getByLabelText('Email'), 'pere@soms.cat');
    await userEvent.selectOptions(canvas.getByLabelText(/Brand/), 'bitepals');
    await userEvent.click(canvas.getByRole('radio', { name: 'Team' }));
    await userEvent.type(canvas.getByLabelText('About'), 'A test');
    await userEvent.click(canvas.getByRole('checkbox', { name: /I accept the terms/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Create workspace' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Acme',
      email: 'pere@soms.cat',
      brand: 'bitepals',
      plan: 'team',
      about: 'A test',
      terms: 'yes',
      updates: 'yes',
    });
  },
};

export const Matrix: Story = {
  name: 'Matrix: pulp, light',
  parameters: { controls: { disable: true } },
  globals: { brand: 'pulp', scheme: 'light' },
};
export const MatrixPulpDark: Story = { ...Matrix, name: 'Matrix: pulp, dark', globals: { brand: 'pulp', scheme: 'dark' } };
export const MatrixBitepalsLight: Story = { ...Matrix, name: 'Matrix: bitepals, light', globals: { brand: 'bitepals', scheme: 'light' } };
export const MatrixBitepalsDark: Story = { ...Matrix, name: 'Matrix: bitepals, dark', globals: { brand: 'bitepals', scheme: 'dark' } };
