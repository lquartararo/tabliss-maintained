import icons from "feather-icons/dist/icons.json";
import React, { FC, useState, useRef, useEffect } from "react";
import {
  IconButton,
  RemoveIcon,
  DownIcon,
  UpIcon,
} from "../../../views/shared";
import { Link, IconCacheItem, Cache } from "./types";
import { Icon } from "@iconify/react";
import "./Input.sass";

type Props = Link & {
  number: number;
  onChange: (values: Partial<Link>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove: () => void;
  cache?: Cache;
  setCache: (cache: Cache) => void;
};

const iconList = Object.keys(icons);

const Input: FC<Props> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleIconSelect = (icon: string, identifier: string) => {
    props.onChange({ iconifyIdentifier: identifier, iconifyValue: icon });
    setIsModalOpen(false);
  };

  // Filter icons based on search query
  const filteredIcons = iconList.filter((icon) => {
    const searchQueryNoSpaces = searchQuery.replace(/\s/g, '-');
    return (
      icon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.toLowerCase().includes(searchQueryNoSpaces)
    );
  });

  const isGoogleOrFavicone = props.icon === "_favicon_google" || props.icon === "_favicon_favicone";
  const isCustomIconify = props.icon === "_custom_iconify";
  const isCustomSvg = props.icon === "_custom_svg";
  const isCustomICON = props.icon === "_custom_ico";
  const isCustomUpload = props.icon === "_custom_upload";
  const isFeather = props.iconifyIdentifier === "feather:" || props.icon === "_feather";

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const iconSize = props.customIconSize || 24;
        const cacheKey = `icon_${Date.now()}`;
        
        let iconData: IconCacheItem;
        if (file.type === 'image/svg+xml') {
          iconData = {
            data: result,
            type: 'svg',
            size: iconSize
          };
        } else if (file.type === 'image/x-icon') {
          iconData = {
            data: result,
            type: 'ico',
            size: iconSize
          };
        } else {
          iconData = {
            data: result,
            type: 'image',
            size: iconSize
          };
        }
        
        // Update cache with new icon data
        props.setCache({ 
          ...(props.cache || {}), 
          [cacheKey]: iconData 
        });

        // Update link with reference to cached icon
        props.onChange({
          icon: "_custom_upload",
          iconCacheKey: cacheKey,
          customIconSize: iconSize
        });
      }
    };

    if (file.type === 'image/svg+xml') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const getSelectValues = () => {
    const values: string[] = [];
    if (selectRef.current) {
      const options = selectRef.current.options;
      for (let i = 0; i < options.length; i++) {
        values.push(options[i].value);
      }
    }
    return values;
  };

  useEffect(() => {
    if (props.icon && !getSelectValues().includes(props.icon)) {
      console.warn(`Invalid icon value: ${props.icon}. Migrating to new icon value`);
      props.onChange({ iconifyValue: props.icon, icon: "_feather" });
    }
  }, [props.icon]);

  return (
    <div className="LinkInput">
      <h5>
        <div className="title--buttons">
          <IconButton onClick={props.onRemove} title="Remove link">
            <RemoveIcon />
          </IconButton>
          {props.onMoveDown && (
            <IconButton onClick={props.onMoveDown} title="Move link down">
              <DownIcon />
            </IconButton>
          )}
          {props.onMoveUp && (
            <IconButton onClick={props.onMoveUp} title="Move link up">
              <UpIcon />
            </IconButton>
          )}
        </div>

        {props.number <= 9 ? `Keyboard shortcut ${props.number}` : "Shortcut"}
      </h5>

      <label>
        URL
        <input
          type="url"
          value={props.url}
          onChange={(event) => props.onChange({ url: event.target.value })}
        />
      </label>

      <label>
        Name <span className="text--grey">(optional)</span>
        <input
          type="text"
          value={props.name}
          onChange={(event) => props.onChange({ name: event.target.value })}
        />
      </label>

      <label>
        Icon <span className="text--grey">(optional)</span>
        <select
          ref={selectRef}
          value={props.icon}
          onChange={(event) => props.onChange({ icon: event.target.value })}
        >
          <option value={""}>None</option>
          <optgroup label="Website Icons">
            <option value="_favicon_google">From Google</option>
            <option value="_favicon_duckduckgo">From DuckDuckGo</option>
            <option value="_favicon_favicone">From Favicone</option>
          </optgroup>
          <optgroup label="Custom">
            <option value="_custom_iconify">From Iconify</option>
            <option value="_custom_svg">Custom SVG HTML</option>
            <option value="_custom_ico">Custom ICO url</option>
            <option value="_custom_upload">Upload Custom Icon</option>
          </optgroup>
          <optgroup label="Iconify Icons">
            <option value="_feather">Feather</option>
          </optgroup>
        </select>
      </label>

      {isGoogleOrFavicone && (
        <label>
          Icon Size
          <select
            onChange={(event) => props.onChange({ iconSize: Number(event.target.value) })}
          >
            <option value="16">16x16</option>
            <option value="32">32x32</option>
            <option value="64">64x64</option>
            <option value="128">128x128</option>
            <option value="256">256x256</option>
          </select>
        </label>
      )}

      {isCustomIconify && (
        <label>
          Custom Iconify Identifier
          <input
            type="text"
            onChange={(event) => props.onChange({ IconString: event.target.value })}
          />
          <p>
            Enter the iconify identifier for the icon you want to use in your links. For more detailed info see&nbsp;
            <a href="https://github.com/BookCatKid/tabliss-maintained/issues/3#issuecomment-2676456153" target="_blank" rel="noopener noreferrer">this GitHub issue</a>.
          </p>
        </label>
      )}

      {isCustomSvg && (
        <label>
          Custom SVG HTML
          <textarea
            value={props.SvgString}
            onChange={(event) => props.onChange({ SvgString: event.target.value })}
          />
          <p>
            Enter your custom SVG HTML code above to use an icon in your links. For more detailed info see&nbsp;
            <a href="https://github.com/BookCatKid/tabliss-maintained/issues/3#issuecomment-2676456153" target="_blank" rel="noopener noreferrer">this GitHub issue</a>.
          </p>
        </label>
      )}

      {isCustomSvg && (
        <label>
          Custom SVG Size
          <input
            type="number"
            value={props.customIconSize}
            onChange={(event) => props.onChange({ customIconSize: Number(event.target.value) })}
          />
        </label>
      )}

      {isCustomICON && (
        <label>
          Custom ICO url
          <input
            type="text"
            value={props.IconStringIco}
            onChange={(event) => props.onChange({ IconStringIco: event.target.value })}
          />
          <p>Enter a url on the internet for a .ico file</p>
        </label>
      )}

      {isCustomUpload && (
        <div>
          <label>
            Upload Icon
            <input
              type="file"
              accept=".svg,.ico,image/*"
              onChange={handleFileUpload}
            />
          </label>
          {props.iconCacheKey && props.cache && (
            <div>
              <label>
                Icon Size
                <input
                  type="number"
                  value={props.customIconSize}
                  onChange={(event) => props.onChange({ customIconSize: Number(event.target.value) })}
                />
              </label>
            </div>
          )}
          </div>
        )}

        {isFeather && (
          <div className="icon-picker">
            <button onClick={handleOpenModal} className="custom-select">
              {props.icon ? `Open icon picker` : "Choose an Icon"}
            </button>
          </div>
        )}

        {isModalOpen && (
        <div className="Modal-container" onClick={handleCloseModal}>
          <div className="Modal" onClick={(event) => event.stopPropagation()}>
            <h2>Select an Icon</h2>

            <input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar"
            />

            <div className="icon-grid">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((icon) => (
                  <button
                    key={icon}
                    className="icon-box"
                    onClick={() => handleIconSelect(icon, "feather:")}
                  >
                    <Icon icon={"feather:" + icon} />
                    <span>{icon.replace(/-/g, ' ')}</span>
                  </button>
                ))
              ) : (
                <p className="no-results">No icons found</p>
              )}
            </div>

            <button className="close-button" onClick={handleCloseModal}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <hr />
    </div>
  );
};

export default Input;
