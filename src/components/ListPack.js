import Card from './Card';
import '../styles/list-pack.css';

const ListPack = () => {
  const fileSelectionHandler = (event) => {
    console.log(event.target);
  };

  return (
    <>
      <div className="list-pack-container">
        <form className="form">
          <input
            id="img-input"
            name="img-input"
            type="file"
            accept="image/png, image/jpg, image/jpeg"
            onChange={fileSelectionHandler}
          ></input>
        </form>
        <div className="list-pack"></div>
        <Card />
      </div>
    </>
  );
};

export default ListPack;
