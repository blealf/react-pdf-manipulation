import { useEffect } from 'react'
import PropTypes from 'prop-types'

const panelSidesStyle = `w-full h-1/2 overflow-hidden min-w-[300px] border border-gray-300`
export const LeftPanel = ({ children }) => {
  return (
    <div
      id="m_left_panel"
      className={`${panelSidesStyle} left-0`}
      style={{ scrollbarWidth: 'thin'}}
    >
       <div className="">
        {children}
      </div>
    </div>
  )
}

export const RightPanel = ({ children }) => {
  return (
    <div
      id="m_right_panel"
      className={`${panelSidesStyle} relative right-0`}
      style={{ scrollbarWidth: 'thin'}}
    >
      <div
        id="m_gutter"
        className="w-full h-[10px] bg-gray-300 absolute top-0 left-0 right-0 cursor-row-resize "
      ></div>
      <div className="overflow-y-scroll h-full">
        {children}
      </div>
    </div>
  )
}

LeftPanel.propTypes = {
  children: PropTypes.node,
}

RightPanel.propTypes = {
  children: PropTypes.node,
}

const Panel = ({ children }) => {
  useEffect(() => {
    const leftPane = document.querySelector("#m_left_panel");
    const rightPane = document.querySelector("#m_right_panel");
    const gutter = document.querySelector("#m_gutter");

    function resizer(e) {
      
      window.addEventListener('mousemove', mousemove);
      window.addEventListener('mouseup', mouseup);
      
      // let prevX = e.x;
      let prevY = e.y;
      const leftPanel = leftPane.getBoundingClientRect();
      const rightPanel = rightPane.getBoundingClientRect();
      
      
      function mousemove(e) {
        let newY = prevY - e.y;
        leftPane.style.height = leftPanel.height - newY + "px";
        rightPane.style.height = rightPanel.height + newY + "px";
      }
      // function mousemove(e) {
      //   let newX = prevX - e.x;
      //   leftPane.style.width = leftPanel.width - newX + "px";
      //   rightPane.style.width = rightPanel.width + newX + "px";
      // }
      
      function mouseup() {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);
      }
    }
    gutter.addEventListener('mousedown', resizer);

    return () => {
      gutter.removeEventListener('mousedown', resizer);
    }
  },)
  
  return (
    <div id="m_panel" className="w-full !h-[95vh] relative flex flex-col items-start border border-gray-300 rounded-xl">
      {children}
    </div>
  )
}

Panel.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
  type: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string
}

export default Panel
