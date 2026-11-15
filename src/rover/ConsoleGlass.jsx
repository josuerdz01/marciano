import React,{useLayoutEffect,useRef,useState} from 'react';
// One sampled backdrop across the board, tab and concave joins. Separate blurred
// fragments can sample black or acquire a visibly different tint at their edges.
export default function ConsoleGlass({docked}){
 const ref=useRef(),[shape,setShape]=useState(null);
 useLayoutEffect(()=>{const host=ref.current?.parentElement;if(!host)return;const board=host.querySelector('.rover-cockpit'),tab=host.querySelector('.is-docked');
  const measure=()=>{if(!board)return;const box=host.getBoundingClientRect(),b=board.getBoundingClientRect(),w=+box.width.toFixed(2),h=+box.height.toFixed(2),y=+(b.top-box.top).toFixed(2),r=Math.min(22,(h-y)/2);if(w<=0||h<=0)return;
   let path;if(tab&&docked){const t=tab.getBoundingClientRect(),l=+(t.left-box.left).toFixed(2),R=+(t.right-box.left).toFixed(2),j=Math.min(28,l-r,w-R-r),k=j*.55228475;
    path=`M${r} ${y}H${l-j}C${l-j+k} ${y} ${l} ${y-j+k} ${l} ${y-j}V20Q${l} 0 ${l+20} 0H${R-20}Q${R} 0 ${R} 20V${y-j}C${R} ${y-j+k} ${R+j-k} ${y} ${R+j} ${y}H${w-r}Q${w} ${y} ${w} ${y+r}V${h-r}Q${w} ${h} ${w-r} ${h}H${r}Q0 ${h} 0 ${h-r}V${y+r}Q0 ${y} ${r} ${y}Z`;
   }else path=`M${r} 0H${w-r}Q${w} 0 ${w} ${r}V${h-r}Q${w} ${h} ${w-r} ${h}H${r}Q0 ${h} 0 ${h-r}V${r}Q0 0 ${r} 0Z`;
   setShape(old=>old?.path===path?old:{path,w,h});
  };measure();const observer=new ResizeObserver(measure);for(const el of [host,board,tab])if(el)observer.observe(el);return()=>observer.disconnect();
 },[docked]);
 return <><div ref={ref} className="console-glass" style={shape?{clipPath:`path("${shape.path}")`}:{visibility:'hidden'}}/>{shape&&<svg className="console-glass-edge" viewBox={`0 0 ${shape.w} ${shape.h}`} preserveAspectRatio="none" aria-hidden="true"><path d={shape.path} fill="none" stroke="var(--glass-ring)" strokeWidth="1"/></svg>}</>;
}
