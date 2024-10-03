import PropTypes from 'prop-types';
import loadingsvg from '../assets/loading-spinner-svgrepo-com.svg'

export const MButton = (props) => {
  
  const loadingComponent = () => {
    return (<span className="flex justify-center items-center animate-spin">
      <img src={loadingsvg} alt="loading" className="w-5 h-5" />
    </span>)
  }

  const classStyle = `h-[50px] text-white font-bold py-2 px-4 rounded-lg shadow-md disabled:bg-gray-500 
    flex justify-center items-center disabled:cursor-not-allowed`

  const type = () => {
    switch (props.type) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-700'
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-700'
      case 'success':
        return 'bg-green-500 hover:bg-green-700'
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-700'
      case 'dark':
        return 'bg-gray-800 hover:bg-gray-900'
      case 'link':
        return 'bg-transparent hover:bg-transparent'
      case 'danger':
        return 'bg-red-500 hover:bg-red-700'
      default:
        return 'bg-blue-500 hover:bg-blue-700'
    }
  }

  const size = () => {
    switch (props.size) {
      case 'small':
        return 'text-sm min-w-24'
      case 'medium':
        return 'text-base min-w-32'
      case 'large':
        return 'text-lg min-w-40'
      default:
        return 'text-base min-w-32'
    }
  }
  return (
    <button
      {...props}
      className={`${classStyle} ${type()} ${size()} ${props.className}`}
    >
      {props.loading ? loadingComponent() : props.children}
    </button>
  )
}

MButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node,
  type: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string
}

