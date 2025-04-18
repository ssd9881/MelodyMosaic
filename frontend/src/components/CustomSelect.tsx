import Select from "react-select";
import { CustomOptionType } from "../Classes/CustomOption";
import CustomOption from "./CustomOption";

type CustomSelectProps = {
    options: CustomOptionType[];
    onSelectChange: (id: string) => void;
}

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: '#1a1a1a',
    borderColor: state.isFocused ? '#1ED760' : '#1DB954',
    borderWidth: '1.5px',
    borderRadius: '8px',
    boxShadow: state.isFocused ? '0 0 10px #1ED76088' : '0 0 6px #1DB95455',
    color: '#1DB954',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '1rem',
    padding: '2px 6px',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#1ED760'
    }
  }),

  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#121212',
    borderRadius: '8px',
    boxShadow: '0 0 10px #1DB95444',
    zIndex: 10
  }),

  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#1ED76022' : '#121212',
    color: '#e0ffe0',
    cursor: 'pointer',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: '0.95rem',
    padding: '10px 12px'
  }),

  singleValue: (provided: any) => ({
    ...provided,
    color: '#1DB954',
    fontWeight: 500,
    textShadow: '0 0 6px #1DB95455'
  }),

  menuList: (provided: any) => ({
    ...provided,
    maxHeight: '200px',
    overflowY: 'auto',
    overflowX: 'hidden'
  }),

  placeholder: (provided: any) => ({
    ...provided,
    color: '#888',
    fontStyle: 'italic'
  }),

  indicatorSeparator: () => ({
    display: 'none'
  }),

  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,
    color: state.isFocused ? '#1ED760' : '#1DB954',
    '&:hover': {
      color: '#1ED760'
    }
  })
};


const CustomSelect: React.FC<CustomSelectProps> = ({ options, onSelectChange }) => (
    <Select
        className="custom-select"
        options={options}
        getOptionLabel={(option) => `${option.name} by ${option.authors}`}
        getOptionValue={(option) => option.id}
        components={{ Option: CustomOption }}
        onChange={(option) => option && onSelectChange(option.id)}
        styles={customStyles}
    />
);

export default CustomSelect;