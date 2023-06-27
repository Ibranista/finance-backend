import { MessageBox } from '@admin-bro/design-system';

export default props => {
  const { record } = props;
  let status = 'success';
  let message = 'Activation Email sent successfully';

  if (typeof record.errors === 'string') {
    status = 'danger';
    message = record.errors;
  }
  return <MessageBox message={message} variant={status} />;
};
