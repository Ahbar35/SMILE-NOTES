import React, { useState, useEffect } from "react";
import { Slider, Checkbox, Spin, Collapse, Input } from "antd";
import { firestore } from "config/firebase";
import { FilterOutlined, EyeOutlined } from "@ant-design/icons";
import {
  getDocs,
  collection,
  limit,
  query,
  startAfter,
} from "firebase/firestore";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link, useNavigate } from "react-router-dom";
import MenuHero from "../Menu/MenuHero";
import { useAuthContext } from "contexts/AuthContext";

const { Panel } = Collapse;
const categories = ["Study", "Evilness", "Spritual", "World", "Humans"];

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const { user, isAuthenticated, isAppLoading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsRef = collection(firestore, "items");
        const firstQuery = query(productsRef, limit(20));
        const querySnapshot = await getDocs(firstQuery);
        
        const productsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setProducts(productsList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) => {
      const withinPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
      const inSelectedCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesSearchQuery = product.itemName.toLowerCase().includes(searchQuery.toLowerCase());
      return withinPriceRange && inSelectedCategory && matchesSearchQuery;
    });
    setFilteredProducts(filtered);
  }, [products, priceRange, selectedCategories, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
        <Spin />
      </div>
    );
  }

  const fetchMoreData = async () => {
    try {
      setLoading(true);
      const productsRef = collection(firestore, "items");
      const nextQuery = query(productsRef, startAfter(lastVisible), limit(10));
      const querySnapshot = await getDocs(nextQuery);
      
      const moreProducts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setProducts((prevProducts) => [...prevProducts, ...moreProducts]);
    } catch (error) {
      console.error("Error fetching more products: ", error);
    } finally {
      setLoading(false);
    }
  };

  const preview = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="menu-container container">
      <MenuHero />
      <div className="row">
        <div className="col-lg-3 col-md-4 col-sm-12 mb-4">
          <div className="filter-section">
            <div className="mb-5 d-flex justify-content-between fw-bold">
              <div>Filters</div>
              <div><FilterOutlined /></div>
            </div>
            <Collapse>
              <Panel header="Filter">
                <div className="filter-item">
                  <Input
                    placeholder="Search items"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>

                <div className="filter-item mt-5">
                  <h4 className="text-secondary">Categories</h4>
                  <Checkbox.Group
                    options={categories}
                    onChange={setSelectedCategories}
                  />
                </div>
              </Panel>
            </Collapse>
          </div>
        </div>

        <div className="col-lg-9 col-md-8 col-sm-12">
          <InfiniteScroll
            dataLength={filteredProducts.length}
            next={fetchMoreData}
            hasMore={true}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>Yay! You've seen it all</b>
              </p>
            }
          >
            <div id="card-container">
              {filteredProducts.map((product, i) => (
                <div id="card" key={i}>
                  <div className="card-img">
                    <img
                      onClick={() => preview(product)}
                      src={product.mainImageUrl}
                      alt={product.itemName}
                    />
                  </div>
                  <div className="card-info">
                    <p className="text-title" style={{ width: "150px" }}>{product.itemName}</p>
                  </div>
                  <div className="card-footer">
                    <span className="text-title">{product.description}</span>
                    <EyeOutlined onClick={() => preview(product)} />
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default Menu;

