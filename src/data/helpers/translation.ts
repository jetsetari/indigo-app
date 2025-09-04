import i18n from '~/data/content/translations';
//import { useUserStore } from '~/data/stores/userStore';

type Language = 'en';

export default function useTranslation() {
  //const { user } = useUserStore();
  //const lang = (user?.language ?? 'en') as Language;
  const lang = 'en' as Language;
  return i18n[lang];
}
