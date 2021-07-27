import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";


type InputFieldProps = {
  name: string;
  label: string;
  type?:string;
}

export const InputField: React.FC<InputFieldProps> = ({ name, label,type }) => {
  const [field, { error }] = useField<any>(name);
  return (
     <> 
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} id={field.name} type={type} />
     {!error ?<FormErrorMessage>{error}</FormErrorMessage>:null} 
    </FormControl>
    </>
  );
};
