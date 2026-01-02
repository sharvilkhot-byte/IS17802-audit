
export function ensureConsent(consent: boolean) {
    if (!consent) {
        throw new Error("User has not consented to challenges");
    }
}
