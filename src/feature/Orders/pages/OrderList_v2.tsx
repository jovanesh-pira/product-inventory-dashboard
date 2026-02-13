import  { useState,useEffect } from 'react'
import  {type OrderDomain } from '../model/order.schema'
import {collection,getDocs,limit,orderBy,query, QueryDocumentSnapshot, type DocumentData} from "firebase/firestore"
import {db} from "@/lib/firebace"
import {Order_page_next,Order_page_prev} from "../api/order.api"
function OrderList_v2() {
    const [orderlist,setListOrders]=useState<OrderDomain[]>([])
    const [loading,setLoading]=useState(false)
    const [error,SetError]=useState<string | null>(null)
    const [lastOrder,setLastOrder]=useState<QueryDocumentSnapshot<DocumentData> | null>(null)
    const [firstItem,setFirstItem]=useState<QueryDocumentSnapshot<DocumentData> | null>(null)
    const [isHasNext,setHasNext]=useState(true)
    const [isHasPrev,setHasPrev]=useState(false)
    const [history_pages,setHistory_Pages]=useState<number[]>([])
    const [page,setPage]=useState(1)
    const Order_collection=collection(db,"orders")
    const items_per_page=2
    
    useEffect(()=>{
    var isMounted=true
    let get_All_Orders=async()=>{
        
        setLoading(true)
        SetError(null)
        try{
            
            let query_order=query(Order_collection,orderBy("createdAt","desc"),limit(2))
            const snap_orders=await getDocs(query_order)
        
           
            if(!snap_orders) throw new Error("not founded orders !!")
            let list_order__snap=snap_orders?.docs.map(snap=>{
        
        return {
            id:snap.id,
            ...snap.data()
        }
            })
            let parsed_snap_order_list= list_order__snap as any // this one is not good need to define the schema !!!
            if(!isMounted) return 
           
            setLastOrder(snap_orders.docs[snap_orders.docs.length-1]??null)
            setFirstItem(snap_orders.docs[0]??null)
            setListOrders(parsed_snap_order_list)
            
            
        }catch(err){
            console.log(err)
        }finally{
            setLoading(false)
            SetError(null)
            if(!isMounted) return 
        }
    }
    get_All_Orders()
   return ()=>{
    isMounted=false
   }
    },[])
   
//   ineed the pagination 
    async function nextHandler(){
         if(!lastOrder || !isHasNext) return
    let orders=await Order_page_next({item_per_page:items_per_page,lastItem:lastOrder})
    if(!orders.list_of_orders || orders.list_of_orders.length==0){
        setHasNext(orders.can_iGo_Next)
        return
    }
    setPage(Math.max(1,page+1))
       setHistory_Pages(prev=>[...prev,page])
    setListOrders(orders.list_of_orders)
    const nextLast = orders.last_item
    setLastOrder(nextLast);
    setHasNext(orders.can_iGo_Next);
    setFirstItem(orders.first_item)
    setHasPrev(true)
    }
    
console.log(history_pages)

   
 async function  prevHandler(){
    if(!firstItem || !isHasPrev) return 
    let Orders=await Order_page_prev({item_per_page:items_per_page,firstItem})
    console.log(Orders.list_of_orders)
    if(!Orders.list_of_orders || Orders.list_of_orders.length==0 ) {
        setHasPrev(false)
        return
    }
    
     
     setListOrders(Orders.list_of_orders)
     setFirstItem(Orders.first_item)
     setLastOrder(Orders.last_item)
     setHasNext(Orders.can_iGo_Next)
     
     setPage(prev=>prev-1)
     setHistory_Pages(prev=>prev.slice(0,-1))
     setHasPrev(history_pages.length-1>0 )
    
     
     
 }


    if(loading) return <h1>loading...</h1>
    if(error) return <h1>SomeErr</h1>
  return (
    <div>
     {orderlist.length==0 ?<h1>Empty order</h1>:orderlist.map(order=>{
        return <h1>{order?.customer.name}</h1>
     })}
      <button onClick={()=>{prevHandler()}} className={`${isHasPrev?"text-gray-800":"text-gray-500/40"}`}>Prev</button>
      <span>{page}</span>
     <button onClick={()=>{nextHandler()}}>Next</button>
    
    </div>
  )
}

export default OrderList_v2
