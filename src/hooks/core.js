import { QSpinnerHourglass, useQuasar } from 'quasar';

const $q = useQuasar();

export function hideWorking() {
    $q.loading.hide();
}

export function showNotification(type, text, duration = 5000) {
    $q.notify({
        type: type,
        icon: null,
        message: text,
        multiLine: true,
        position: 'top',
        timeout: duration
    });
}

export function showWorking(text = null) {
    $q.loading.show({
        spinner: QSpinnerHourglass,
        spinnerColor: 'primary',
        spinnerSize: 140,
        backgroundColor: 'grey',
        message: text,
        messageColor: 'primary',
        customClass: 'text-h4'
    })
}
