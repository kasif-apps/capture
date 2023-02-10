import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Capture } from './Capture';

export default {
  title: 'Example/Capture',
  component: Capture,
} as ComponentMeta<typeof Capture>;

const Template: ComponentStory<typeof Capture> = (args) => <Capture {...args} />;

export const Basic = Template.bind({});

Basic.args = {
  type: 'basic',
};

export const Grid = Template.bind({});

Grid.args = {
  type: 'grid',
};
