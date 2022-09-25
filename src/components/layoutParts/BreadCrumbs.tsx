import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../languages';

export type PathArrayType = {
    name: string;
    link?: string;
};

export function useMakePathArray(): PathArrayType[] {
    const location = useLocation();
    const t = useLanguage();

    let linkIteration = '';
    let name = '';
    return location.pathname
        .replace(/^\//g, '')
        .split('/')
        .map((item, index) => {
            linkIteration += '/' + item;
            linkIteration = linkIteration.replace('//', '/');
            name = item.charAt(0).toUpperCase() + item.slice(1);

            return {
                name: t(name),
                link: linkIteration,
            };
        });
}

export function updateBreadCrumbsPathArray(
    index: number,
    newElement: PathArrayType,
    pathArray: PathArrayType[]
): PathArrayType[] {
    if (pathArray && pathArray.length) {
        pathArray[index].name = newElement.name;
        if (newElement.link !== undefined)
            pathArray[index].link = newElement.link;
    }
    return pathArray;
}

export default function BreadCrumbs({
    breadCrumbsPathArray,
}: {
    breadCrumbsPathArray?: PathArrayType[];
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const breadCrumbsPathArrayDefault = useMakePathArray();

    if (location.pathname === '/') return null;
    if (breadCrumbsPathArray === undefined) {
        breadCrumbsPathArray = breadCrumbsPathArrayDefault;
    }

    return (
        <nav className="breadCrumbs">
            {breadCrumbsPathArray &&
                breadCrumbsPathArray.map((breadCrumb, index) => {
                    return (
                        <span
                            className="breadCrumbsSpan"
                            key={breadCrumb.name + breadCrumb.link?.toString()}
                        >
                            {breadCrumbsPathArray &&
                            index < breadCrumbsPathArray.length - 1 ? (
                                <a
                                    href={breadCrumb.link}
                                    onClick={(event: any) => {
                                        event.preventDefault();
                                        navigate(event.target.pathname);
                                    }}
                                >
                                    {breadCrumb.name}
                                </a>
                            ) : (
                                breadCrumb.name
                            )}
                        </span>
                    );
                })}
        </nav>
    );
}
