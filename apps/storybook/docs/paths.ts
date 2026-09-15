import type manifest from '../../../packages/react/dist/component-manifest.json';

type Entry = (typeof manifest)['components'][number];

/** Components whose stories file is named after a sibling (the file, hence the story title, is the key). */
export const STORY_OF: Record<string, string> = { DialogSystem: 'Dialog', Radio: 'RadioGroup', ToastProvider: 'Toast' };

/** Story title of a component: `Components/<Category>/<Story>`; the dist smoke test keeps the files in step. */
export const storyTitle = (component: Pick<Entry, 'name' | 'category'>) => `Components/${component.category}/${STORY_OF[component.name] ?? component.name}`;

/** Storybook lowercases the title as is and joins the segments with dashes: 'Components/Forms/TextField' → components-forms-textfield. */
export const docsPath = (component: Pick<Entry, 'name' | 'category'>) => `/docs/${storyTitle(component).toLowerCase().replaceAll('/', '-')}--docs`;
