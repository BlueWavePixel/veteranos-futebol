import { getLocale } from "@/lib/i18n/get-locale";
import { t, tArray } from "@/lib/i18n/translations";

export default async function PrivacidadePage() {
  const locale = await getLocale();
  const items = tArray("privacy", "s3Items", locale);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl prose prose-invert prose-green">
      <h1>{t("privacy", "title", locale)}</h1>

      <h2>{t("privacy", "s1Title", locale)}</h2>
      <p>{t("privacy", "s1Text", locale)}</p>

      <h2>{t("privacy", "s2Title", locale)}</h2>
      <p>{t("privacy", "s2Text", locale)}</p>

      <h2>{t("privacy", "s3Title", locale)}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2>{t("privacy", "s4Title", locale)}</h2>
      <p>{t("privacy", "s4Text", locale)}</p>

      <h2>{t("privacy", "s5Title", locale)}</h2>
      <p>{t("privacy", "s5Text", locale)}</p>

      <h2>{t("privacy", "s6Title", locale)}</h2>
      <p>{t("privacy", "s6Intro", locale)}</p>
      <ul>
        <li><strong>{t("privacy", "s6Access", locale).split(": ")[0]}</strong>: {t("privacy", "s6Access", locale).split(": ").slice(1).join(": ")}</li>
        <li><strong>{t("privacy", "s6Rectification", locale).split(": ")[0]}</strong>: {t("privacy", "s6Rectification", locale).split(": ").slice(1).join(": ")}</li>
        <li><strong>{t("privacy", "s6Erasure", locale).split(": ")[0]}</strong>: {t("privacy", "s6Erasure", locale).split(": ").slice(1).join(": ")}</li>
        <li><strong>{t("privacy", "s6Portability", locale).split(": ")[0]}</strong>: {t("privacy", "s6Portability", locale).split(": ").slice(1).join(": ")}</li>
        <li><strong>{t("privacy", "s6Withdraw", locale).split(": ")[0]}</strong>: {t("privacy", "s6Withdraw", locale).split(": ").slice(1).join(": ")}</li>
      </ul>

      <h2>{t("privacy", "s7Title", locale)}</h2>
      <p>{t("privacy", "s7Text", locale)}</p>

      <h2>{t("privacy", "s8Title", locale)}</h2>
      <p>{t("privacy", "s8Text", locale)}</p>

      <h2>{t("privacy", "s9Title", locale)}</h2>
      <p>{t("privacy", "s9Text", locale)}</p>

      <h2>{t("privacy", "s10Title", locale)}</h2>
      <p>{t("privacy", "s10Text", locale)}</p>
    </div>
  );
}
