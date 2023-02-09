import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Capture } from './Capture';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Capture',
  component: Capture,
} as ComponentMeta<typeof Capture>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Capture> = (args) => <Capture {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
// Primary.args = {
//   primary: true,
//   label: 'Capture',
// };

// export const Secondary = Template.bind({});
// Secondary.args = {
//   label: 'Capture',
// };

// export const Large = Template.bind({});
// Large.args = {
//   size: 'large',
//   label: 'Capture',
// };

// export const Small = Template.bind({});
// Small.args = {
//   size: 'small',
//   label: 'Capture',
// };
