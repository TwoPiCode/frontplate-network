
// @flow

import moment from 'moment'

const FORMAT_DATE = 'DD/MM/YYYY'
const FORMAT_DATETIME = 'DD/MM/YYYY HH:mm p'

export const formatDate = (date: string) =>{
  return moment(date).format(FORMAT_DATE)
}

export const formatDatetime = (datetime: string) => {
  return moment(datetime).format(FORMAT_DATETIME)
}
