import { CustomOptionType } from "../Classes/CustomOption";

type CustomOptionProps = {
    innerProps: any; // These are props passed by react-select, typing is generally any
    data: CustomOptionType;
  }

const CustomOption: React.FC<CustomOptionProps> = ({ innerProps, data }) => (
    <div {...innerProps}>
      <div className="row">
        <div className='col-2'>
          <img src={data.image.length === 0? "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/2048px-No_image_available.svg.png" : data.image} alt={data.name} style={{ width: 50, height: 50, marginRight: 10 }} />
        </div>
        <div className='col-9'>
          <p>{data.name} by {data.authors}</p>
        </div>
      </div>
    </div>
  );
  
  export default CustomOption;