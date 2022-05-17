import { useState } from 'react';
import '../styles/cards.css';
import '../styles/action-info-section.css';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
const ActionInfoSection = ({ packImg }) => {
  const slides = [
    'https://imgs.search.brave.com/x_mHaHeOzAP6m4AO4Y8CwLfTEJEOcsiQUtAu7GAoY50/rs:fit:844:225:1/g:ce/aHR0cHM6Ly90c2Uy/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC5h/cVNWRTdUVWNic0xD/UWRGX0ZQZlJnSGFF/SyZwaWQ9QXBp',
    'https://imgs.search.brave.com/KyEgDrl_4w15225CaXT8vcM8nPTOlE0KNYUwQfsvuJE/rs:fit:1200:900:1/g:ce/aHR0cHM6Ly9pLmtp/bmphLWltZy5jb20v/Z2F3a2VyLW1lZGlh/L2ltYWdlL3VwbG9h/ZC9zLS0tSnAzb0U5/NS0tL2NfZmlsbCxm/bF9wcm9ncmVzc2l2/ZSxnX2NlbnRlcixo/XzkwMCxxXzgwLHdf/MTYwMC8xOTl6cGZp/OGRpZzJuanBnLmpw/Zw',
    'https://imgs.search.brave.com/loTV87KtT37rPVjqTN0-Vg4zCBOC2lt5TXfDPy4c820/rs:fit:1200:1200:1/g:ce/aHR0cDovL3d3dy50/aGV3b3dzdHlsZS5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MTUvMDEvbmF0dXJl/LWltYWdlcy5qcGc',
    'https://imgs.search.brave.com/mcwnWR2bgfV8YNVaO92L6QaZer57E4lEKdWuDlwDVZs/rs:fit:600:500:1/g:ce/aHR0cHM6Ly9kM2xw/NHhlZGJxYThhNS5j/bG91ZGZyb250Lm5l/dC9zMy9kaWdpdGFs/LWNvdWdhci1hc3Nl/dHMvbm93LzIwMTcv/MTIvMjAvMTUxMzcy/OTQ5MzQxM19Eb25h/bGR0cnVtcHJvYm90/LmpwZz93aWR0aD02/OTAmaGVpZ2h0PSZt/b2RlPWNyb3AmcXVh/bGl0eT03NQ',
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const length = slides.length;

  const nextSlide = () => {
    setCurrentSlide(currentSlide === length - 1 ? 0 : currentSlide + 1);
  };
  const prevSlide = () => {
    setCurrentSlide(currentSlide === 0 ? length - 1 : currentSlide - 1);
  };
  return (
    <>
      <div className='info-section-container'>
        <img src={packImg} width='25%'></img>
        <div className='pack-info'>
          <p>Dipshits</p>
          <p>ID: 1</p>
          <p>Pack Amount: 3</p>
        </div>
      </div>
      <section className='pack-imgs'>
        <div className='slide-img'>
          <FaArrowRight className='next-img' onClick={() => nextSlide()} />
          <FaArrowLeft className='prev-img' onClick={() => prevSlide()} />
          {slides.map((slide, index) => {
            return (
              <div
                key={index}
                className={index === currentSlide ? 'slide-active' : slide}
              >
                {index === currentSlide && (
                  <img src={slide} className='slide-img' width='70%'></img>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default ActionInfoSection;
