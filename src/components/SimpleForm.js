import '../styles/profile.css';

const SimpleForm = ({
  labelTitle,
  placeholder,
  onChangeFc,
  onClickFc,
  btnTitle,
  fetchedData,
}) => {
  return (
    <form className="forms">
      <label>{labelTitle}</label>
      <input
        className="input-box"
        type="number"
        placeholder={placeholder}
        min="1"
        onChange={onChangeFc}
      />
      <button className="btn-global" onClick={onClickFc}>
        {btnTitle}
      </button>
      <span style={{ marginTop: '.5rem' }}>{fetchedData}</span>
    </form>
  );
};

export default SimpleForm;
