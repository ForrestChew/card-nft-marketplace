import '../styles/main.css';

const Button = ({ btnName, onClick }) => {
  return (
    <button className="btn-global" onClick={() => onClick()}>
      {btnName}
    </button>
  );
};

export default Button;
