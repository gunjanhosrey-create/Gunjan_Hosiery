import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Product } from '@/types/index';

interface ProductOptionsProps {
  product: Product;
}

export default function ProductOptions({ product }: ProductOptionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");

  const categories = [
    "men",
    "kids",
    "boys",
    "girls",
  ];

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) =>
      Math.min(product?.stock_quantity || 1, prev + 1)
    );
  };

  return (
    <div className="space-y-6">
      {/* Category Dropdown */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Select Category
        </Label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>

        {/* DEBUG */}
        <p className="text-sm text-muted-foreground mt-2">
          Selected: {category || 'None'}
        </p>
      </div>

      {/* Quantity Selector */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Quantity
        </Label>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={quantity <= 1}
          >
            -
          </Button>

          <span className="text-lg font-semibold w-12 text-center">
            {quantity}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={quantity >= (product?.stock_quantity || 1)}
          >
            +
          </Button>
        </div>

        {/* Stock Info */}
        <p className="text-sm text-muted-foreground mt-2">
          Available Stock: {product?.stock_quantity || 0}
        </p>
      </div>
    </div>
  );
}
