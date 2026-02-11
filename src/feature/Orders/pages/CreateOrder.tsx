import  { useEffect, useState } from "react";
import { db } from "@/lib/firebace";
import {  getDocs, collection,serverTimestamp,doc,runTransaction } from "firebase/firestore";
import { pick_any_name, create_random_email ,generatePhone,generateAvatar,addToCart,cartTotal} from "../api/order.api";
import {type CartItem} from "../model/orders.types"
import { MdShoppingCart } from "react-icons/md";
import {CartDrawer} from "../ui/CartComponent"
function CreateOrder() {
  const [productList, setProductList] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [random_customer, setRandom_Customer] = useState<any>(null);
  const[cartList,setCartList]=useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
    setLoading(true);
    setErr(null);
    let isLive = true;
    (async () => {
      try {
        let col_ref = collection(db, "products");
        let snap_product = await getDocs(col_ref);
        let product_snap = snap_product.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
          };
        });

        if (!isLive) return;
        setProductList(product_snap);
      } catch (err) {
        if (!isLive) return;
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setErr(message);
      } finally {
        setLoading(false);
        if (!isLive) return;
      }
    })();
    return () => {
      isLive = false;
    };
  }, []);
  if (loading) return <h1>Loading....</h1>;
  function RandomCustomer_Handler() {
    setRandom_Customer(null);
    setRandom_Customer({
      name: pick_any_name(),
      email: create_random_email(),
      phone:generatePhone(),
      avatar_url:generateAvatar()
    });
  }
  function AddCart_Handler(product:any){
   let new_product_cart= addToCart(cartList,product)
  let pared_new_product_cart=new_product_cart as any
   
   setCartList(pared_new_product_cart)

  }
  async function handleCheckout():Promise<void> {
  if (!random_customer?.email) {
    throw new Error("Customer email is required");
  }
  if (!cartList.length) {
    throw new Error("Cart is empty");
  }

  const customerId = customerIdFromEmail(random_customer.email);

  const customerRef = doc(db, "customers", customerId);
  const orderRef = doc(collection(db, "orders")); // auto id

  const items = cartList.map((it) => ({
    productId: it.productId,
    name: it.name,
    price: it.price,
    qty: it.qty,
    subtotal: it.subtotal,
    imageUrl: it.imageUrl ?? null, // ✅ عکس داخل سفارش
  }));

  const totalPrice = items.reduce((s, it) => s + it.subtotal, 0);

  await runTransaction(db, async (tx) => {
    // 1) upsert customer
    const customerSnap = await tx.get(customerRef);

    const customerPayload = {
      name: random_customer.name,
      email: random_customer.email.trim().toLowerCase(),
      phone: random_customer.phone ?? null,
      avatar: random_customer.avatar_url ?? null,
      updatedAt: serverTimestamp(),
    };

    if (!customerSnap.exists()) {
      tx.set(customerRef, {
        ...customerPayload,
        createdAt: serverTimestamp(),
        ordersCount: 0,
      });
    } else {
      tx.update(customerRef, customerPayload);
    }

    // 2) create order
    tx.set(orderRef, {
      customerId,
      customer: {
        name: customerPayload.name,
        email: customerPayload.email,
        phone: customerPayload.phone,
        avatar: customerPayload.avatar,
      },
      items,
      totalPrice,
      status: "pending",
      source: "manual",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 3) optional: update customer stats
    tx.set(
      customerRef,
      {
        lastOrderAt: serverTimestamp(),
        ordersCount: (customerSnap.data()?.ordersCount ?? 0) + 1,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // (قدم بعدی) کاهش stock محصولات هم همینجا انجام میشه، ولی فعلاً نگه می‌داریم برای بعد از status=paid
  });
}

  return (
    <div className="w-full h-full min-h-0 flex flex-col">
  
 <CartDrawer cartList={cartList} setCartList={setCartList} handleCheckout={handleCheckout}/>


 


  
      <div className="shrink-0 p-4">
        <section className="bg-white rounded-2xl shadow-sm border p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Customer</h2>
              <p className="text-sm text-gray-500">
                Generate a random customer before creating the order.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
                onClick={() => RandomCustomer_Handler()}
              >
                Random Customer
              </button>

            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <div className="mt-1 flex items-center gap-3 p-3 rounded-xl border">
                {random_customer?.avatar_url?<img src={random_customer?.avatar_url} className="w-20 h-20" /> : <div className="w-20 h-20 rounded-full bg-gray-200"></div> }
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {random_customer
                      ? random_customer.name
                      : "No customer Generated !"}
                  </div>
                  <div className="text-sm text-gray-500 truncate space-y-1 mt-2">
                    <p>{random_customer?.email ?? "some email"}</p>
                    <p>{random_customer?.phone ?? "123456567889"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="flex-1 min-h-0 p-4">
        <section className="bg-white rounded-2xl shadow-sm border p-4 h-full flex flex-col overflow-hidden">
          <div className="shrink-0">
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="text-sm text-gray-500">
              Add items to cart to build the order.
            </p>
          </div>
        
          <div className="flex-1 min-h-0 overflow-y-auto mt-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {productList?.map((p) => (
                
                <div key={p.id} className="rounded-2xl border overflow-hidden">
                   <img src={p.imageUrl??"/placeholder_image.png"} alt={p.name}  className="h-40 object-center object-cover w-full "/>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">
                          {p?.name ?? "Untitled"}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          SKU: {p?.sku ?? "—"} • {p?.category ?? "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold">{p?.price ?? 0} ₸</div>
                        <div className="text-sm text-gray-500">
                          Stock: {p?.stock ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button className="px-3 py-2 rounded-xl border hover:bg-gray-50">
                        Details
                      </button>
                      <button className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90" onClick={()=>AddCart_Handler(p)}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!productList?.length && (
              <div className="mt-6 text-center text-gray-500">
                No products found.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateOrder;


function customerIdFromEmail(email: string) {
  return email.trim().toLowerCase();
}
