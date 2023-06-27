import { MessageBox } from '@admin-bro/design-system';

const message = props => {
  const { record } = props;
  let status = 'success';
  let message = 'Sub pages updated with new sitemap data.';

  if (typeof record.errors === 'string') {
    status = 'danger';
    message = record.errors;
  }
  return <MessageBox message={message} variant={status} />;
};

export default message;
