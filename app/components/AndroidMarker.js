import React from 'react'
import Image from 'react-native'
import markerDot from '../assets/images/markerdot.png'
import PropTypes from "prop-types"

const stopRendering = () => setTracksViewChanges(false)

const AndroidMarker = () => {
    return (
        <Image source={markerDot} style={{ height: 20, width: 20 }} onLoad={stopRendering} />
    )
}

AndroidMarker.propTypes = {
    numMachines: PropTypes.number,
}

export default AndroidMarker
