import React from "react";
import { Form, Formik } from "formik";
import { Box, Button } from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";

const Register: React.FC<{}> = () => {
  return (
    <Wrapper variant="Small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
         console.log(values)
        }}
      >
      
         {({})=>(<Form>
            <InputField name="username" label="User Name" />
            <Box mt={3}>
            <InputField name="password" label="Password" type="Password" />
            </Box>
            <Box mt={3}>
            <Button type="submit" color='teal' >Submit</Button>
            </Box>
          </Form>)} 
        
      </Formik>
    </Wrapper>
  );
};

export default Register;
