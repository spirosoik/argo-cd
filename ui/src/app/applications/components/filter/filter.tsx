import {ActionButton, Autocomplete, CheckboxOption, CheckboxRow} from 'argo-ui/v2';
import classNames from 'classnames';
import * as React from 'react';

import './filter.scss';

interface FilterProps {
    selected: string[];
    setSelected: (items: string[]) => void;
    options?: CheckboxOption[];
    label?: string;
    labels?: string[];
    field?: boolean;
    error?: boolean;
    retry?: () => void;
    loading?: boolean;
    radio?: boolean;
    wrap?: boolean;
}

export const FiltersGroup = (props: {children?: React.ReactNode; appliedFilter?: string[]; shown: boolean; setShown: (val: boolean) => void; onClearFilter?: () => void}) => {
    return (
        <div className='filters-group'>
            <div className='filters-group__container__title'>
                FILTERS <i className='fa fa-filter' />
                {props.appliedFilter?.length > 0 && props.onClearFilter && (
                    <ActionButton label={'CLEAR ALL'} action={() => props.onClearFilter()} style={{marginLeft: 'auto', fontSize: '12px', lineHeight: '5px', display: 'block'}} />
                )}
                <ActionButton
                    label={!props.shown ? 'SHOW' : 'HIDE'}
                    action={() => props.setShown(!props.shown)}
                    style={{marginLeft: props.appliedFilter?.length > 0 ? '5px' : 'auto', fontSize: '12px', lineHeight: '5px'}}
                />
            </div>
            <div className={classNames('filters-group__container', {'filters-group__container--hidden': !props.shown})}>{props.children}</div>
        </div>
    );
};

export const Filter = (props: FilterProps) => {
    const init = {} as {[label: string]: boolean};
    props.selected.forEach(s => (init[s] = true));

    const [values, setValues] = React.useState(init);
    const [tags, setTags] = React.useState([]);
    const [input, setInput] = React.useState('');
    const [collapsed, setCollapsed] = React.useState(false);

    const labels = props.labels || props.options.map(o => o.label);

    React.useEffect(() => {
        const map: string[] = Object.keys(values).filter(s => values[s]);
        props.setSelected(map);
        if (props.field) {
            setTags(
                Object.keys(values).map(v => {
                    return {label: v} as CheckboxOption;
                })
            );
        }
    }, [values]);

    React.useEffect(() => {
        if (props.selected.length === 0) {
            setValues({} as {[label: string]: boolean});
            setInput('');
        }
    }, [props.selected.length]);

    return (
        <div className={classNames('filter', {'filter--wrap': props.wrap})}>
            <div className='filter__header'>
                {props.label || 'FILTER'}
                {(props.selected || []).length > 0 || (props.field && Object.keys(values).length > 0) ? (
                    <div
                        className='argo-button argo-button--base argo-button--sm'
                        style={{marginLeft: 'auto'}}
                        onClick={() => {
                            setValues({} as {[label: string]: boolean});
                            setInput('');
                        }}>
                        <i className='fa fa-times-circle' /> CLEAR
                    </div>
                ) : (
                    <i className={`fa fa-caret-${collapsed ? 'down' : 'up'} filter__collapse`} onClick={() => setCollapsed(!collapsed)} />
                )}
            </div>
            {!collapsed &&
                (props.loading ? (
                    <FilterLoading />
                ) : props.error ? (
                    <FilterError retry={props.retry} />
                ) : (
                    <React.Fragment>
                        {props.field && (
                            <Autocomplete
                                placeholder={props.label}
                                items={labels}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onItemClick={val => {
                                    const update = {...values};
                                    update[val ? val : input] = true;
                                    setInput('');
                                    setValues(update);
                                }}
                                style={{width: '100%'}}
                                inputStyle={{marginBottom: '0.5em', backgroundColor: 'white'}}
                            />
                        )}
                        {((props.field ? tags : props.options) || []).map((opt, i) => (
                            <CheckboxRow
                                key={i}
                                value={values[opt.label]}
                                onChange={val => {
                                    const update = props.radio && val ? {} : {...values};
                                    update[opt.label] = val;
                                    setValues(update);
                                }}
                                option={opt}
                            />
                        ))}
                    </React.Fragment>
                ))}
        </div>
    );
};

const FilterError = (props: {retry: () => void}) => (
    <div className='filter__error'>
        <i className='fa fa-exclamation-circle' /> ERROR LOADING FILTER
        <div onClick={() => props.retry()} className='filter__error__retry'>
            <i className='fa fa-redo' /> RETRY
        </div>
    </div>
);

const FilterLoading = () => (
    <div className='filter__loading'>
        <i className='fa fa-circle-notch fa-spin' /> LOADING
    </div>
);
