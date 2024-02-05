'use client';

import { Button } from '@bigcommerce/reactant/Button';
import { AlertCircle, Check, Heart } from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { getProduct } from '~/client/queries/getProduct';
import { ExistingResultType } from '~/client/util';

import { Link } from '../Link';

import { handleAddToCart } from './_actions/addToCart';
import { AddToCart } from './AddToCart';
import { CheckboxField } from './Fields/CheckboxField';
import { DateField } from './Fields/DateField';
import { MultiLineTextField } from './Fields/MultiLineTextField';
import { MultipleChoiceField } from './Fields/MultipleChoiceField';
import { NumberField } from './Fields/NumberField';
import { QuantityField } from './Fields/QuantityField';
import { TextField } from './Fields/TextField';
import { ProductFormData, useProductForm } from './useProductForm';

type Product = ExistingResultType<typeof getProduct>;

export const productFormSubmit = async (data: ProductFormData) => {
  const result = await handleAddToCart(data);
  const quantity = Number(data.quantity);

  if (result?.error) {
    toast.error(result.error || 'Something went wrong. Please try again.', {
      icon: <AlertCircle className="text-red-100" />,
    });

    return;
  }

  toast.success(
    () => (
      <div className="flex items-center gap-3">
        <span>
          {quantity} {quantity === 1 ? 'Item' : 'Items'} added to{' '}
          <Link className="font-semibold text-blue-primary hover:text-blue-secondary" href="/cart">
            your cart
          </Link>
        </span>
      </div>
    ),
    { icon: <Check className="text-green-100" /> },
  );
};

export const ProductForm = ({ product }: { product: Product }) => {
  const { handleSubmit, register, ...methods } = useProductForm();

  return (
    <FormProvider handleSubmit={handleSubmit} register={register} {...methods}>
      <form className="flex flex-col gap-6 @container" onSubmit={handleSubmit(productFormSubmit)}>
        <input type="hidden" value={product.entityId} {...register('product_id')} />

        {product.productOptions?.map((option) => {
          if (option.__typename === 'MultipleChoiceOption') {
            return <MultipleChoiceField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'CheckboxOption') {
            return <CheckboxField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'NumberFieldOption') {
            return <NumberField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'MultiLineTextFieldOption') {
            return <MultiLineTextField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'TextFieldOption') {
            return <TextField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'DateFieldOption') {
            return <DateField key={option.entityId} option={option} />;
          }

          return null;
        })}

        <QuantityField />

        <div className="mt-4 flex flex-col gap-4 @md:flex-row">
          <AddToCart disabled={product.availabilityV2.status === 'Unavailable'} />

          {/* NOT IMPLEMENTED YET */}
          <div className="w-full">
            <Button disabled type="submit" variant="secondary">
              <Heart aria-hidden="true" className="mx-2" />
              <span>Save to wishlist</span>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};