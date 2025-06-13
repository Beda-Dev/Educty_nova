"use client";
import Card from "@/components/ui/card-snippet";
import BasicSelect from "./basic-select";
import DisabledSelect from "./disabled-select";
import ControlledSelect from "./controlled-select";
import SelectWithDescription from "./select-with-description";
import SelectColors from "./colors-select";
import SizesSelect from "./sizes-select";
import RadiusSelect from "./select-radius";
import DisabledItems from "./disabled-items";
import SelectVariant from "./select-variant";
import CustomSelectorIcon from "./custom-selector-icon";

import {
  basicSelect,
  controlledSelect,
  customSelectorIcon,
  disabledItems,
  disabledSelect,
  radiusSelect,
  selectColors,
  selectVariant,
  selectWithDescription,
  sizesSelect,
} from "./source-code";
const FormSelectPage = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Basic Select" code={basicSelect}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">Select</code> component wrap
          <code className="text-skyblue">SelectTrigger</code> and{" "}
          <code className="text-skyblue">SelectContent</code> tag and show{" "}
          <code className="text-skyblue">SelectValue</code> as label placeholder
          and <code className="text-skyblue">SelectItem</code> to show and
          select item.
        </p>
        <BasicSelect />
      </Card>
      <Card title="Disabled Select" code={disabledSelect}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">disabled</code> props in{" "}
          <code className="text-skyblue">Select</code> Component to disabled the
          select.
        </p>
        <DisabledSelect />
      </Card>
      <Card title="Disabled Items Select" code={disabledItems}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">disabled</code> props in{" "}
          <code className="text-skyblue">SelectItem</code> Component to disabled
          the select item.
        </p>
        <DisabledItems />
      </Card>

      <Card title="Controlled Select" code={controlledSelect}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">onValueChange</code> props in{" "}
          <code className="text-skyblue">Select</code> component to show which
          item is selected.
        </p>
        <ControlledSelect />
      </Card>
      <Card title="Select With Description" code={selectWithDescription}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">Label</code> component and short
          description with
          <code className="text-skyblue"> Select</code> component to show
          describer select component.
        </p>
        <SelectWithDescription />
      </Card>
      <Card title="Custom Selector Icon" code={customSelectorIcon}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">icon</code> props in
          <code className="text-skyblue"> SelectTrigger </code> component to
          show icon on selected.
        </p>
        <CustomSelectorIcon />
      </Card>
      <Card title="Colors Select" code={selectColors}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">color</code> props and{" "}
          <code className="text-skyblue">variant="flat"</code> props to show
          flat background color in
          <code className="text-skyblue"> SelectTrigger </code> component to
          show color on selected.
        </p>
        <SelectColors />
      </Card>
      <Card title="Sizes Select" code={sizesSelect}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">size</code> props in
          <code className="text-skyblue"> SelectTrigger </code> component to
          show different size for select component.
        </p>
        <SizesSelect />
      </Card>
      <Card title="Radius Select" code={radiusSelect}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">radius</code> props in
          <code className="text-skyblue"> SelectTrigger </code> component to
          show different radius for select component.
        </p>
        <RadiusSelect />
      </Card>
      <Card title="Variant Select" code={selectVariant}>
        <p className="text-sm text-default-400 dark:text-default-600  mb-4">
          <code className="text-skyblue">variant</code> props in
          <code className="text-skyblue"> SelectTrigger </code> component to
          show different variant for select component.
        </p>
        <SelectVariant />
      </Card>
    </div>
  );
};

export default FormSelectPage;
