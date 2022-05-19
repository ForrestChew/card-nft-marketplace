import ReactLoading from 'react-loading';
import '../styles/main.css';
const IsLoading = () => {
  return (
    <div className="is-loading">
      <ReactLoading
        type="cylon"
        color="whitesmoke"
        height={'20%'}
        width={'20%'}
      />
    </div>
  );
};

export default IsLoading;
