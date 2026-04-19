/**
 * Hidden input carrying the CSRF token inside a form.
 * Use inside any form that submits to a mutating server action.
 */
export function CsrfField({ token }: { token: string | null | undefined }) {
  return <input type="hidden" name="_csrf" value={token || ""} />;
}
