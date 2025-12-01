import { Col, Form, Input, Select, InputNumber } from "antd";
import PhoneInput from "react-phone-input-2";

export const TextInputBox = ({
  label,
  name,
  placeholder,
  rules,
  cover,
  className,
  isDisable,
  inputProps,
  ...props
}) => {
  return (
    <Col md={cover ? cover.md : 12}>
      
      <Form.Item
        className={!!className ? className : ""}
        label={label}
        name={name}
        rules={rules}
        normalize={(value) => value.trimStart()}
        {...props}
        // {...props}
      >
        
        <Input placeholder={placeholder} disabled={isDisable} {...inputProps}  autoComplete="off" />
      </Form.Item>
    </Col>
  );
};

export const SelectInput = ({
  label,
  name,
  placeholder,
  options,
  rules,
  cover,
  className,
  defaultValue,
  handleChange,
  ...props
}) => {
  return (
    <Col md={cover ? cover.md : 12}>
      <Form.Item name={name} label={label} rules={rules}>
        <Select
          {...props}
          placeholder={placeholder}
          className={!!className ? className : ""}
          defaultValue={defaultValue}
          onChange={handleChange}
          autoComplete="off"
        >
          { options.map((item, index) => (
                <Select.Option key={item._id} value={item._id} label={item.name}>
                  <span className="cap">{item.name}</span>
                </Select.Option>
              ))
            }
        </Select>
      </Form.Item>
    </Col>
  );
};

export const MultiSelect = ({
  cover,
  name,
  label,
  rules,
  placeholder,
  className,
  options,
}) => {
  return (
    <Col md={cover ? cover.md : 12}>
      <Form.Item name={name} label={label} rules={rules}>
        <Select
          placeholder={placeholder}
          className={!!className ? className : ""}
          mode="multiple" // Set mode to "multiple" for selecting multiple values
        >
          {options && options.length > 0
            ? options.map((item, index) => (
                <Select.Option key={item._id} value={item._id}>
                  <span className="cap">{item.name}</span>
                </Select.Option>
              ))
            : null}
        </Select>
      </Form.Item>
    </Col>
  );
};

export const EmailField = ({ label, name, placeholder, cover, className }) => {
  return (
    <Col md={cover ? cover.md : 12}>
      <Form.Item
        className="mb-0"
        label={label}
        name={name}
        rules={[
          { type: "email", message: "The email is not a valid email!" },
          { required: true, message: "Please enter the email!" },
          {
            max: 50,
            message: "Email should not contain more then 50 characters!",
          },
          {
            min: 5,
            message: "Email should contain at least 5 characters!",
          },
          {
            pattern: new RegExp(
              /^([a-zA-Z0-9._%-]*[a-zA-Z]+[a-zA-Z0-9._%-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
            ),
            message: "Enter valid email!",
          },
        ]}
      >
        <Input autoComplete="off" placeholder={placeholder} />
      </Form.Item>
    </Col>
  );
};

export const PhoneNumberField = ({
  label,
  name,
  placeholder,
  cover,
  className,
  onChange,
  inputProps,
  ...props
}) => {
  return (
    <Col md={cover ? cover.md : 12}>
      <Form.Item className="mb-0" label={label} name={name} 
      rules={[
        {
          required: true,
          message: "Please enter mobile number!",
        },
      ]}
      >
        <PhoneInput
          inputProps={{
            name: name,
            required: true,
            autoFocus: false,
            placeholder: placeholder,
            ...inputProps
          }}
          isValid={(value, country) => {
            if (value.match(/1234/)) {
              return "Invalid value: " + value + ", " + country.name;
            } else if (value.match(/1234/)) {
              return "Invalid value: " + value + ", " + country.name;
            } else {
              return true;
            }
          }}
          //value={}
          country={"il"}
          preferredCountries={["ps","il"]}
          onChange={onChange}
        />
      </Form.Item>
    </Col>
  );
};

export const NumberInputBox = ({
  label,
  name,
  placeholder,
  rules,
  cover,
  className,
  ...props
}) => {
  return (
    <Col md={cover ? cover.md : 12}>
      <Form.Item
        className={!!className ? className : ""}
        label={label}
        name={name}
        rules={rules}
        {...props}
      >
        <InputNumber placeholder={placeholder} />
      </Form.Item>
    </Col>
  );
};
