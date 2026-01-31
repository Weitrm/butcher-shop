

export const currencyFormatter = (value: number) => {

    return value.toLocaleString('es-UY', {
        style: 'currency',
        currency: 'UYU',
        minimumFractionDigits: 0,
    })

}