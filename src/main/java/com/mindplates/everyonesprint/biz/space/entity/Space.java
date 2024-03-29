package com.mindplates.everyonesprint.biz.space.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import javax.persistence.*;
import java.util.List;

@Entity
@Builder
@Table(name = "space", indexes = {
        @Index(name = "IDX_SPACE_CODE", columnList = "code"),
        @Index(name = "IDX_SPACE_ALLOW_SEARCH_AND_ACTIVATED", columnList = "allow_search, activated")
})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Space extends CommonEntity {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false, length = ColumnsDef.NAME)
    private String name;

    @Column(name = "code", nullable = false, length = ColumnsDef.CODE)
    private String code;

    @Column(name = "description", length = ColumnsDef.TEXT)
    private String description;

    @Column(name = "allow_search")
    private Boolean allowSearch;

    @Column(name = "allow_auto_join")
    private Boolean allowAutoJoin;

    @Column(name = "activated")
    private Boolean activated;

    @Column(name = "token", length = ColumnsDef.CODE)
    private String token;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SUBSELECT)
    private List<SpaceUser> users;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "space", cascade = CascadeType.ALL)
    @Column(updatable = false, insertable = false)
    @Fetch(value = FetchMode.SUBSELECT)
    private List<SpaceApplicant> applicants;

}
