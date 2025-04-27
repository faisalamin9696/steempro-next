import BadActorList from "./badActorList";

export function validate_account_name(value: string) {
    let i, label, len, length, ref;

    if (!value) {
        return 'Account name should not be empty';
    }
    length = value.length;
    if (length < 3) {
        return 'Account name should be longer';
    }
    if (length > 16) {
        return 'Account name should be shorter';
    }
    if (BadActorList.includes(value)) {
        return 'Chain valifation occurred';
    }
    ref = value.split('.');
    for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
            return 'Each account segment should start with a letter'

        }
        if (!/^[a-z0-9-]*$/.test(label)) {
            return 'Each account segment should have only letters digits or dashes'

        }
        if (/--/.test(label)) {
            return 'Each account segment should have only one dash in a row'

        }
        if (!/[a-z0-9]$/.test(label)) {
            return 'chainvalidation_js.Each account segment should end with a letter or digit'

        }
        if (!(label.length >= 3)) {
            return 'each account segment should be longer'

        }
    }
    return null;
}
