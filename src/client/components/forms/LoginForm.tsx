import React from 'react';

import Input from '../base/Input';
import CSRFForm from '../CSRFForm';

interface LoginModalProps {
  loginCallback: string;
  formRef: React.RefObject<HTMLFormElement>;
}

const LoginForm: React.FC<LoginModalProps> = ({ loginCallback, formRef }) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({
    username: '',
    password: '',
    loginCallback: loginCallback,
  });

  return (
    <CSRFForm ref={formRef} method="POST" action="/user/login" formData={formData}>
      <Input
        label="Username or Email Address"
        maxLength={1000}
        name="username"
        id="username"
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <Input
        label="Password"
        maxLength={1000}
        name="password"
        id="password"
        type="password"
        link={{ href: '/user/lostpassword', text: 'Forgot Password?' }}
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        onEnter={() => formRef.current?.submit()}
      />
    </CSRFForm>
  );
};

export default LoginForm;
