import React from 'react'
import PropTypes from 'prop-types'

const CurrencyFormatter = ({ value, currency, locale }) => {
  if (value === null || value === undefined) return ''

  const usedLocale = locale || (currency === 'USD' ? 'en-US' : 'fa-IR')
  let formattedValue = ''

  switch (currency) {
    case 'USD':
      formattedValue = new Intl.NumberFormat(usedLocale, {
        style: 'currency',
        currency: 'USD',
      }).format(value)
      break
    case 'IRR':
      formattedValue =
        new Intl.NumberFormat(usedLocale, {
          maximumFractionDigits: 0,
        }).format(value) + ' ریال'
      break
    case 'Toman':
      formattedValue =
        new Intl.NumberFormat(usedLocale, {
          maximumFractionDigits: 0,
        }).format(value) + ' تومان'
      break
    default:
      formattedValue = new Intl.NumberFormat(usedLocale).format(value)
  }

  return <span>{formattedValue}</span>
}

CurrencyFormatter.propTypes = {
  value: PropTypes.number,
  currency: PropTypes.oneOf(['USD', 'IRR', 'Toman']).isRequired,
  locale: PropTypes.string,
}

export default React.memo(CurrencyFormatter)
