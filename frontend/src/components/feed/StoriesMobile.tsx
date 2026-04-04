"use client";
export default function StoriesMobile() {
  return (
    <div className="_feed_inner_ppl_card_mobile _mar_b16">
      <div className="_feed_inner_ppl_card_area">
        <ul className="_feed_inner_ppl_card_area_list">
          <li className="_feed_inner_ppl_card_area_item">
            <a href="#0" className="_feed_inner_ppl_card_area_link">
              <div className="_feed_inner_ppl_card_area_story">
                <img src="/assets/images/mobile_story_img.png" alt="Image" className="_card_story_img" />
                <div className="_feed_inner_ppl_btn">
                  <button className="_feed_inner_ppl_btn_link" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 12 12">
                      <path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" d="M6 2.5v7M2.5 6h7"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
            </a>
          </li>
          {[1,2,1,2,1].map((i, idx) => (
            <li className="_feed_inner_ppl_card_area_item" key={idx}>
              <a href="#0" className="_feed_inner_ppl_card_area_link">
                <div className={i===1? '_feed_inner_ppl_card_area_story_active' : '_feed_inner_ppl_card_area_story_inactive'}>
                  <img src={`/assets/images/${i===1? 'mobile_story_img1.png' : 'mobile_story_img2.png'}`} alt="Image" className="_card_story_img1" />
                </div>
                <p className="_feed_inner_ppl_card_area_txt">Ryan...</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

