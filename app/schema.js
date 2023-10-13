import * as Yup from 'yup';

export const signUpSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password too short').required('Password is required'),
  passwordAgain: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Field required'),
});

export const signInSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password too short'),
  });



