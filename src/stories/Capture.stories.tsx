import { Capture } from './Capture';

export default {
  title: 'Example/Capture',
  component: Capture,
};

const Template = (args: { type: 'basic' | 'grid' | 'scroll' }) => <Capture {...args} />;

export const Basic = Template.bind({});

// @ts-ignore
Basic.args = {
  type: 'basic',
};

export const Grid = Template.bind({});

// @ts-ignore
Grid.args = {
  type: 'grid',
};

export const Scroll = Template.bind({});

// @ts-ignore
Scroll.args = {
  type: 'scroll',
};

export const LoadTest = Template.bind({});

// @ts-ignore
LoadTest.args = {
  type: 'load-test',
};
