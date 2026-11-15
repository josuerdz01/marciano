import React from 'react';
import {MorphIcon} from 'morphicons/react';
import {Play,Pause} from 'lucide';
// lucide 0.468 wraps nodes in [svg, attributes, children]; Morphicons takes the children.
const play=Play[2],pause=Pause[2];
export default function PlayPauseIcon({playing,size=16}){return <MorphIcon icon={playing?pause:play} size={size} strokeWidth={1.8} spring="smooth" reducedMotion="user"/>}
